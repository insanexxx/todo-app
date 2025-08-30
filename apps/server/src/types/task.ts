export interface ITask {
    id: number,
    title: string,
    description?: string,
    dueDate: string,
    priority: EnumPriority,
    status: EnumStatus,
    creatorId: number,
    assigneeId: number,
    created_at: string,
    updated_at: string,
}
export enum EnumStatus {
    todo = 'TODO',
    in_progress = 'IN_PROGRESS',
    done = 'DONE',
    canceled = 'CANCELED'
}
export enum EnumPriority {
    high = 'HIGH',
    medium = 'MEDIUM',
    low = 'LOW'
}