export class User {
    loginUser(loginObj: User) {
        throw new Error('Method not implemented.');
    }

    emailId: string;
    password: string;


    constructor() {
        this.emailId = '';
        this.password = '';
    }

}

export interface IUserModel {
    userId: number
    emailId: string
    password: string
    createdDate: string
    projectName: string
    fullName: string
    mobileNo: string
    extraId: any
}
export interface ResponseModel {
    message: string
    result: boolean
    data: any
}
export interface ISite {
    siteId: number
    clientId: number
    siteName: string
    siteCity: string
    siteAddress: string
    sitePinCode: string
    totalBuildings: number
    createdDate: string
}



