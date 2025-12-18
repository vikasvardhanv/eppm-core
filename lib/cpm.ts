import { Activity, Relationship } from '@prisma/client';
import { addHours, differenceInHours } from 'date-fns';
import { prisma } from './prisma';

type ActivityWithRelations = Activity & {
  predecessors: (Relationship & { predecessor: Activity })[];
  successors: (Relationship & { successor: Activity })[];
};

export async function scheduleProject(projectId: string) {
  // 1. Fetch Data
  const activities = await prisma.activity.findMany({
    where: { projectId },
    include: {
      predecessors: { include: { predecessor: true } },
      successors: { include: { successor: true } }
    }
  });

  if (activities.length === 0) return;

  // Map for easy access
  const activityMap = new Map<string, ActivityWithRelations>();
  activities.forEach(a => activityMap.set(a.id, a));

  // 2. Forward Pass
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");
  
  const projectStart = project.startDate;

  let changed = true;
  let iterations = 0;
  const maxIterations = activities.length * 2; 

  // Initialize
  activities.forEach(a => {
    a.earlyStart = projectStart;
    a.earlyFinish = addHours(projectStart, a.remainingDuration);
  });

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const activity of activities) {
      let maxEarlyStart = projectStart.getTime();

      for (const rel of activity.predecessors) {
        const pred = activityMap.get(rel.predecessorId);
        if (!pred || !pred.earlyFinish) continue;

        let potentialStart = pred.earlyFinish.getTime();
        const lag = rel.lag * 3600 * 1000; 

        if (rel.type === 'FS') {
           potentialStart = pred.earlyFinish.getTime() + lag;
        } else if (rel.type === 'SS') {
           potentialStart = (pred.earlyStart?.getTime() || projectStart.getTime()) + lag;
        } else if (rel.type === 'FF') {
           const finishConstraint = pred.earlyFinish.getTime() + lag;
           potentialStart = finishConstraint - (activity.remainingDuration * 3600 * 1000);
        } else if (rel.type === 'SF') {
           const finishConstraint = (pred.earlyStart?.getTime() || projectStart.getTime()) + lag;
           potentialStart = finishConstraint - (activity.remainingDuration * 3600 * 1000);
        }

        if (potentialStart > maxEarlyStart) {
          maxEarlyStart = potentialStart;
        }
      }

      const newES = new Date(maxEarlyStart);
      const newEF = addHours(newES, activity.remainingDuration);

      if (newES.getTime() !== activity.earlyStart?.getTime()) {
        activity.earlyStart = newES;
        activity.earlyFinish = newEF;
        changed = true;
      }
    }
  }

  // 3. Backward Pass
  let maxProjectFinish = projectStart.getTime();
  activities.forEach(a => {
    if (a.earlyFinish && a.earlyFinish.getTime() > maxProjectFinish) {
      maxProjectFinish = a.earlyFinish.getTime();
    }
  });

  const projectFinishDate = new Date(maxProjectFinish);

  activities.forEach(a => {
    a.lateFinish = projectFinishDate;
    a.lateStart = addHours(projectFinishDate, -a.remainingDuration);
  });

  changed = true;
  iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const activity of activities) {
      let minLateFinish = projectFinishDate.getTime();
      const successors = activity.successors;
      
      if (successors.length > 0) {
         let hasSuccessorConstraint = false;
         
         for (const rel of successors) {
            const succ = activityMap.get(rel.successorId);
            if (!succ || !succ.lateStart) continue;
            
            hasSuccessorConstraint = true;
            let potentialFinish = minLateFinish;
            const lag = rel.lag * 3600 * 1000;

            if (rel.type === 'FS') {
               potentialFinish = succ.lateStart.getTime() - lag;
            } else if (rel.type === 'SS') {
               const potentialStart = succ.lateStart.getTime() - lag;
               potentialFinish = potentialStart + (activity.remainingDuration * 3600 * 1000);
            } else if (rel.type === 'FF') {
               potentialFinish = (succ.lateFinish?.getTime() || projectFinishDate.getTime()) - lag;
            } else if (rel.type === 'SF') {
               const potentialStart = (succ.lateFinish?.getTime() || projectFinishDate.getTime()) - lag;
               potentialFinish = potentialStart + (activity.remainingDuration * 3600 * 1000);
            }

            if (potentialFinish < minLateFinish) {
               minLateFinish = potentialFinish;
            }
         }
         
         if (!hasSuccessorConstraint) {
            minLateFinish = projectFinishDate.getTime();
         }
      } else {
         minLateFinish = projectFinishDate.getTime();
      }

      const newLF = new Date(minLateFinish);
      const newLS = addHours(newLF, -activity.remainingDuration);

      if (newLF.getTime() !== activity.lateFinish?.getTime()) {
        activity.lateFinish = newLF;
        activity.lateStart = newLS;
        changed = true;
      }
    }
  }

  // 4. Calculate Float & Critical Path
  const updates = [];
  for (const activity of activities) {
    const totalFloat = differenceInHours(activity.lateFinish!, activity.earlyFinish!);
    let freeFloat = 0;
    
    if (activity.successors.length === 0) {
       freeFloat = 0; 
    } else {
       let minSuccessorStart = Number.MAX_VALUE;
       activity.successors.forEach(rel => {
          const succ = activityMap.get(rel.successorId);
          if (succ && succ.earlyStart) {
             let succStart = succ.earlyStart.getTime();
             if (rel.type === 'FS') {
                succStart = succ.earlyStart.getTime() - (rel.lag * 3600 * 1000);
             }
             if (succStart < minSuccessorStart) minSuccessorStart = succStart;
          }
       });
       if (minSuccessorStart === Number.MAX_VALUE) {
          freeFloat = totalFloat;
       } else {
          freeFloat = differenceInHours(new Date(minSuccessorStart), activity.earlyFinish!);
       }
    }

    const isCritical = totalFloat <= 0; 

    updates.push(prisma.activity.update({
      where: { id: activity.id },
      data: {
        earlyStart: activity.earlyStart,
        earlyFinish: activity.earlyFinish,
        lateStart: activity.lateStart,
        lateFinish: activity.lateFinish,
        totalFloat,
        freeFloat,
        isCritical
      }
    }));
  }
  
  updates.push(prisma.project.update({
     where: { id: projectId },
     data: { finishDate: projectFinishDate }
  }));

  await prisma.$transaction(updates);
  return { projectFinishDate, activities };
}
