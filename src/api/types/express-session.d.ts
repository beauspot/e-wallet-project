import { Session } from "express-session";
import { Request } from "express";

// Extending the Request interface to include the session property
declare global {
    namespace Express {
        interface Request {
            session: Session; // Define the session property with the correct type
        }
    }
}