export interface MessageBrokerInterface {
    getUserData(id: number): Promise<any>
}