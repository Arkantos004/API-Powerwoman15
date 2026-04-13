import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const requestInstructor: (req: Request, res: Response) => Promise<void>;
export declare const getInstructorRequests: (req: Request, res: Response) => Promise<void>;
export declare const approveInstructor: (req: Request, res: Response) => Promise<void>;
export declare const rejectInstructor: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map