// src/api.ts
import { serverFetch } from './server';
import { Timestamp } from 'firebase/firestore';

// --- Egresso ---
export interface EgressoData {
    name: string;
    profileImage: string;
    faceImage: string;
    facePoints: string;
    course?: string;
    graduationYear?: string;
    personalDescription: string;
    contactLinks: string[];
    verified: boolean;
    username: string;
    passwordHash: string;
    id?: string;
    careerDescription: string;
    termsAccepted: boolean;
}
export class Egresso {
    name: string;
    profileImage: string;
    faceImage: string;
    facePoints: string;
    course?: string;
    graduationYear?: string;
    personalDescription: string;
    contactLinks: string[];
    verified: boolean;
    username: string;
    passwordHash: string;
    id?: string;
    careerDescription: string;
    termsAccepted: boolean;

    constructor(data?: Partial<EgressoData> & { id?: string }) {
        this.name = data?.name || "";
        this.profileImage = data?.profileImage || "";
        this.faceImage = data?.faceImage || "";
        this.facePoints = data?.facePoints || "";
        this.course = data?.course;
        this.graduationYear = data?.graduationYear;
        this.personalDescription = data?.personalDescription || "";
        this.contactLinks = data?.contactLinks || [];
        this.verified = data?.verified ?? false;
        this.username = data?.username || "";
        this.passwordHash = data?.passwordHash || "";
        this.id = data?.id;
        this.careerDescription = data?.careerDescription || "";
        this.termsAccepted = data?.termsAccepted ?? false;
    }

    static async getEgresso(id: string): Promise<Egresso | null> {
        const response = await serverFetch({ url: `/egressos/${id}`, method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            return new Egresso({ ...data, id: data.id });
        } else {
            // console.error("Error getting egresso:", await response.text());  // Use .text()
            return null;
        }
    }

    static async getEgressos(): Promise<Egresso[]> {
        const response = await serverFetch({ url: '/egressos', method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            return data.map((egressoData: EgressoData & { id: string }) => new Egresso(egressoData));
        } else {
            //  console.error("Error getting egressos:", await response.text()); // Use .text()
            return [];
        }
    }

    static async getEgressosByUsername(username: string): Promise<Egresso | null> {
        const response = await serverFetch({ url: `/egressos?username=${username}`, method: 'GET' });
        if (response.ok) {
            const data = await response.json();
            return new Egresso({ ...data, id: data.id });
        } else {
            // console.error("Error getting egresso by username:", await response.text()); // Use .text()
            return null;
        }
    }

    async save(): Promise<Egresso | null> {

        if (this.id) {
            // Update
            const response = await serverFetch({
                url: `/egressos/${this.id}`,
                method: 'PUT',
                body: this.toJson()
            });

            if (response.ok) {
                return this;
            } else {
                //console.error("Error updating egresso:", await response.text()); // Use .text()
                return null;
            }
        } else {
            return null; 
        }
    }

    static async deleteEgresso(id: string): Promise<boolean> {
        const response = await serverFetch({ url: `/egressos/${id}`, method: 'DELETE' });
        return response.ok;
    }

    toJson(): Partial<EgressoData> {
        const data: Partial<EgressoData> = {
            name: this.name,
            profileImage: this.profileImage,
            faceImage: this.faceImage,
            facePoints: this.facePoints,
            course: this.course,
            graduationYear: this.graduationYear,
            personalDescription: this.personalDescription,
            contactLinks: this.contactLinks,
            verified: this.verified,
            username: this.username,
            passwordHash: this.passwordHash,
            careerDescription: this.careerDescription,
            termsAccepted: this.termsAccepted,
        };

        if (this.id) {
            data.id = this.id;
        }

        return data;
    }

    static fromJson(data: EgressoData & { id: string }): Egresso {
        return new Egresso(data);
    }
}

// --- Admin ---
export interface AdminData {
    name: string;
    username: string;
    role: string;
    passwordHash: string;
    id?: string;
}

export class Admin {
    name: string;
    username: string;
    role: string;
    passwordHash: string;
    id?: string;

    constructor(data: Partial<AdminData> & { id?: string }) {
        this.name = data.name || "";
        this.username = data.username || "";
        this.role = data.role || "";
        this.passwordHash = data.passwordHash || "";
        this.id = data.id;
    }

    static async getAdmin(id: string): Promise<Admin | null> {
        const response = await serverFetch({ url: `/admins/${id}`, method: "GET" });
        if (response.ok) {
            const data = await response.json();
            return new Admin({ ...data, id: data.id });
        }
        return null;
    }

    static async getAdminByUsername(username: string): Promise<Admin | null> {
        const response = await serverFetch({ url: `/admins?username=${username}`, method: "GET" });
        if (response.ok) {
            const data = await response.json();
            return new Admin({ ...data, id: data.id });
        }
        return null;
    }

    async save(): Promise<Admin | null> {
        return null;
    }
    toJson(): Partial<AdminData> {
        const data: Partial<AdminData> = {
            name: this.name,
            username: this.username,
            role: this.role,
            passwordHash: this.passwordHash,
        };
        if (this.id) {
            data.id = this.id;
        }
        return data;
    }
}
// --- Invite ---
interface Invite {
    code: string;
    used: boolean;
    createdBy: string; // Admin ID
    createdAt: Timestamp;
}

// --- Email --- (NEW)
export interface EmailConfigData {
    apiToken: string;
    fromEmail: string;
}

export interface EmailRecipient {
    email: string;
}

export interface EmailSendData {
    recipients: EmailRecipient[];
    subject: string;
    text: string;
    html: string;
}

// --- API Functions ---

export const api = {
    // --- Egresso API ---
    createUser: async (egressoData: EgressoData, inviteCode: string): Promise<Egresso | null> => {
        const response = await serverFetch({
            url: '/egressos',
            method: 'POST',
            body: { ...egressoData, inviteCode }
        });

        if (response.ok) {
            const data = await response.json();
            return new Egresso({ ...data, id: data.id });
        } else {
            return null;
        }
    },

    loginUser: async (username: string, password: string): Promise<Egresso | null> => {
        const response = await serverFetch({
            url: '/login/egresso',
            method: 'POST',
            body: { username, password }
        });

        if (response.ok) {
            const data = await response.json();
            return new Egresso(data);
        } else {
            return null;
        }
    },

    getEgresso: Egresso.getEgresso,
    getEgressos: Egresso.getEgressos,
    deleteEgresso: Egresso.deleteEgresso,
    updateEgresso: async (id: string, updates: Partial<EgressoData>): Promise<Egresso | null> => {
        const currentEgresso = await Egresso.getEgresso(id);
        if (!currentEgresso) return null;
        const updatedEgresso = new Egresso({
            ...currentEgresso,
            ...updates,
            id: currentEgresso.id
        });

        return await updatedEgresso.save();
    },


    // --- Admin API ---
    createAdmin: async (adminData: AdminData): Promise<Admin | null> => {
        const response = await serverFetch({
            url: '/admins',
            method: 'POST',
            body: adminData
        });

        if (response.ok) {
            const data = await response.json();
            return new Admin({ ...data, id: data.id });
        } else {
            return null;
        }
    },

    loginAdmin: async (username: string, password: string): Promise<Admin | null> => {
        const response = await serverFetch({
            url: '/login/admin',
            method: 'POST',
            body: { username, password }
        });
        if (response.ok) {
            const data = await response.json();
            return new Admin({ ...data, id: data.id });
        } else {
            return null;
        }
    },

    getAdmin: Admin.getAdmin,

    // --- Invite API ---
    createInvite: async (adminId: string): Promise<string | null> => {
        const response = await serverFetch({
            url: '/invites',
            method: 'POST',
            body: { adminId }
        });
        if (response.ok) {
            const data = await response.json();
            return data.code;
        } else {
            return null;
        }
    },

    getInvites: async (): Promise<Invite[]> => {
        const response = await serverFetch({ url: '/invites', method: 'GET' });
        if (response.ok) {
            const data: any[] = await response.json(); // Receive as any[] to handle different date types
            return data.map((invite: any) => {
                let createdAtDate: Date | string = invite.createdAt; // Default to original value

                if (invite.createdAt) {
                    if (typeof invite.createdAt.seconds === 'number' && typeof invite.createdAt.nanoseconds === 'number') {
                        // It's a Firestore Timestamp object
                        createdAtDate = new Date(invite.createdAt.seconds * 1000 + invite.createdAt.nanoseconds / 1000000);
                    } else if (typeof invite.createdAt === 'string') {
                        // It's a string, try to parse it as a Date
                        const parsedDate = new Date(invite.createdAt);
                        // Check if parsing was successful (Date objects with invalid dates return NaN for getTime())
                        if (!isNaN(parsedDate.getTime())) {
                            createdAtDate = parsedDate;
                        } else {
                            // If parsing fails, keep it as a string (or handle error appropriately)
                            console.warn(`Could not parse date string: ${invite.createdAt}. Keeping original string.`);
                            createdAtDate = invite.createdAt; // Keep as string
                        }
                    }
                    // If it's already a Date object, it will pass through as is
                }

                return {
                    ...invite,
                    createdAt: createdAtDate, // Assign the processed date (Date object or original string)
                    id: invite.id || invite.code, // Ensure an ID
                } as Invite; // Cast to Invite type
            });
        } else {
            // @ts-ignore
            console.error("Get Invites Error:", response.status, await response.text());
            return [];
        }
    },

    cancelInvite: async (code: string): Promise<boolean> => {
        const response = await serverFetch({
            url: '/invites',
            method: 'PUT',
            body: { code }
        });

        return response.ok;
    },

    // --- Course API (NEW) ---
    getCourses: async (): Promise<string[]> => {
        const response = await serverFetch({ url: '/courses', method: 'GET' });
        if (response.ok) {
            return await response.json();
        } else {
            // @ts-ignore
            console.error("Error getting courses:", await response.text());
            return []; // Return an empty array on error
        }
    },

    saveCourses: async (courses: string[]): Promise<void> => {
        const response = await serverFetch({ url: '/courses', method: "PUT", body: courses });
        if (!response.ok) {
            // @ts-ignoreF
            console.error("Error saving courses:", await response.text());
            //  Handle error appropriately (throw an error, show a message)
        }

    },

    // --- Email API ---
    sendEmail: async (emailData: EmailSendData, adminId: string): Promise<boolean> => {
        // Pass adminId in the body to the server simulation
        const response = await serverFetch({
            url: '/email/send',
            method: 'POST',
            body: { ...emailData, adminId } // Include adminId here
        });
        if (!response.ok) {
            const errorText = await response.text?.();
            console.error(`Error sending email (${response.status}):`, errorText || 'No error text available.');
            throw new Error(`Falha ao enviar e-mail: ${errorText || response.status}`);
        }
        return response.ok;
    },
};