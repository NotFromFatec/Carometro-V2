// src/server.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { EgressoData, AdminData, EmailSendData } from './api';

const useServerBackend = false;

const firebaseConfig = {
    apiKey: "apiKey",
    authDomain: "authDomain",
    projectId: "projectId",
    storageBucket: "storageBucket",
    messagingSenderId: "messagingSenderId",
    appId: "appId"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function simpleHash(password: string): string {
    return btoa(password);
}

function compareHash(password: string, hash: string): boolean {
    return simpleHash(password) === hash;
}

interface FetchRequest {
    url: string;
    method: string;
    body?: any;
    headers?: { [key: string]: string };
}

interface FetchResponse {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
    text?: () => Promise<string>;
}

// --- Simulated Course Data ---
// In a real application, this would be stored in your database.
let simulatedCourses: string[] = [
    "Ciência da Computação",
    "Engenharia de Software",
    "Sistemas de Informação",
    "Análise e Desenvolvimento de Sistemas"
];

export async function serverFetch(request: FetchRequest): Promise<FetchResponse> {
    // await simulateDelay();

    const { url, method, body } = request;

    if (useServerBackend) {
        try {

            let response = await fetch(`/api/v1${url}`, {
                body: JSON.stringify(body),
                method
            });
            console.log(`fetch(api/v1${url}) =>`, response);

            console.log("body:", body);

            console.log("body json:", JSON.stringify(body));

            console.log("method:", method);

            console.log("response:", response);

            return response;
        } catch (error) {
            return {
                ok: false,
                status: 404,
                json: async () => ({ message: error }),
                // @ts-ignore
                text: async () => error.toString(),
            };
        }
    }

    // --- Course API (NEW) ---
    if (url === '/courses') {
        if (method === 'GET') {
            // Simulating fetching courses from storage (replace with real DB call)
            const storedCourses = localStorage.getItem('courses');
            const courses = storedCourses ? JSON.parse(storedCourses!) : simulatedCourses;
            return {
                ok: true,
                status: 200,
                json: async () => courses,
            };
        } else if (method === 'PUT') {
            // Simulating saving courses to storage (replace with real DB call)
            localStorage.setItem('courses', JSON.stringify(body)); //  body should be the courses array
            simulatedCourses = body; // Update in-memory data as well
            return {
                ok: true,
                status: 200, //  or 204 No Content, depending on your API design
                json: async () => { }, //  No content to return
            };
        }
    }


    // --- Egressos API ---
    if (url.startsWith('/egressos')) {
        // ... (rest of the /egressos handling - NO CHANGES HERE) ...
        if (method === 'GET') {
            const parts = url.split('/');
            if (parts.length === 3) { // /egressos/:id
                const id = parts[2];
                const docRef = doc(db, "egressos", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ ...docSnap.data(), id: docSnap.id })
                    };
                } else {
                    return {
                        ok: false,
                        status: 404,
                        json: async () => ({ message: 'Egresso not found' }),
                        text: async () => 'Egresso not found',
                    };
                }
            } else { // /egressos or /egressos?username=...
                const urlObj = new URL(url, 'http://example.com');  // Base URL is arbitrary
                const username = urlObj.searchParams.get('username');

                if (username) {
                    const egressosRef = collection(db, "egressos");
                    const q = query(egressosRef, where("username", "==", username));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const docSnap = querySnapshot.docs[0];
                        return {
                            ok: true,
                            status: 200,
                            json: async () => ({ ...docSnap.data(), id: docSnap.id })
                        };
                    } else {
                        return {
                            ok: false,
                            status: 404,
                            json: async () => ({ message: 'Egresso not found' }),
                            text: async () => 'Egresso not found',
                        };
                    }
                } else {
                    // Get all egressos
                    const querySnapshot = await getDocs(collection(db, "egressos"));
                    const egressos = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    return {
                        ok: true,
                        status: 200,
                        json: async () => egressos
                    };
                }

            }
        } else if (method === 'POST') { // /egressos
            // Create Egresso
            const { inviteCode, ...egressoData } = body;

            // Validate invite code
            const invitesRef = collection(db, "invites");
            const inviteQuery = query(invitesRef, where("code", "==", inviteCode), where("used", "==", false));
            const inviteSnap = await getDocs(inviteQuery);
            if (inviteSnap.empty) {
                return {
                    ok: false,
                    status: 400, // Bad Request
                    json: async () => ({ message: "Invalid or used invite code." }),
                    text: async () => "Invalid or used invite code.",
                };
            }

            const inviteDoc = inviteSnap.docs[0];
            // Check if username already exists.
            // UNIQUE USERNAME CHECK (Egressos only)
            const existingEgressoQuery = query(collection(db, "egressos"), where("username", "==", egressoData.username));
            const existingEgressoSnap = await getDocs(existingEgressoQuery);
            if (!existingEgressoSnap.empty) {
                return {
                    ok: false,
                    status: 409, // Conflict
                    json: async () => ({ message: "Username already exists for another egresso." }),
                    text: async () => "Username already exists for another egresso.",
                };
            }


            const docRef = await addDoc(collection(db, "egressos"), {
                ...egressoData,
                passwordHash: simpleHash(egressoData.passwordHash)
            });

            // Mark invite as used
            await updateDoc(inviteDoc.ref, { used: true });

            return {
                ok: true,
                status: 201, // Created
                json: async () => ({ ...egressoData, id: docRef.id })
            };

        } else if (method === 'PUT') {
            const id = url.split('/')[2];
            const docRef = doc(db, "egressos", id);
            const updates = { ...body }; // Copy to avoid modifying the original

            console.log("id:", id);
            console.log("docRef:", docRef);
            console.log("updates:", updates);

            // Ensure passwordHash is hashed if present
            // if (updates.passwordHash) {
            //     updates.passwordHash = simpleHash(updates.passwordHash);
            // }

            await updateDoc(docRef, updates);

            return {
                ok: true,
                status: 200,
                json: async () => ({ ...updates, id })
            };
        } else if (method === 'DELETE') {
            const id = url.split('/')[2];
            const docRef = doc(db, "egressos", id);
            await deleteDoc(docRef);
            return {
                ok: true,
                status: 204, // No Content
                json: async () => ({}) // Or any other success indicator
            };
        }
    } else if (url.startsWith('/admins')) {
        // --- Admin API ---
        if (method === 'GET') {
            const parts = url.split('/');
            if (parts.length === 3) { //   /admins/:id
                const id = parts[2];
                const docRef = doc(db, "admins", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ ...docSnap.data(), id: docSnap.id })
                    };
                }
                return {
                    ok: false,
                    status: 404,
                    json: async () => ({ message: 'Admin not found' }),
                    text: async () => 'Admin not found',
                };
            }
            else { //admins?username=value
                const urlObj = new URL(url, 'http://example.com');  // Base URL is arbitrary
                const username = urlObj.searchParams.get('username');
                if (username) {
                    const adminsRef = collection(db, "admins");
                    const q = query(adminsRef, where("username", "==", username));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const docSnap = querySnapshot.docs[0];
                        return {
                            ok: true,
                            status: 200,
                            json: async () => ({ ...docSnap.data(), id: docSnap.id })
                        };
                    }
                    return {
                        ok: false,
                        status: 404,
                        json: async () => ({ message: 'Admin not found' }),
                        text: async () => 'Admin not found'
                    };
                }
            }
            return {
                ok: false,
                status: 400, // Bad request
                json: async () => ({ message: 'Invalid Get request to /admins' }),
                text: async () => 'Invalid Get request to /admins',
            }

        }
        else if (method === 'POST') {
            const adminData = body;
            // UNIQUE USERNAME CHECK (Admins only)
            const existingAdminQuery = query(collection(db, "admins"), where("username", "==", adminData.username));
            const existingAdminSnap = await getDocs(existingAdminQuery);
            if (!existingAdminSnap.empty) {
                return {
                    ok: false,
                    status: 409, // Conflict
                    json: async () => ({ message: "Username already exists for another admin." }),
                    text: async () => "Username already exists for another admin.",
                };
            }
            const docRef = await addDoc(collection(db, "admins"), {
                ...adminData,
                passwordHash: simpleHash(adminData.passwordHash)
            });
            return {
                ok: true,
                status: 201,
                json: async () => ({ ...adminData, id: docRef.id })
            };
        }
    } else if (url.startsWith('/invites')) {
        // --- Invites API ---

        if (method === "GET") {
            const invitesRef = collection(db, "invites");
            const querySnapshot = await getDocs(invitesRef);
            const invites = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })); // Include document ID as 'code'

            return {
                ok: true,
                status: 200,
                json: async () => invites
            }
        }
        else if (method === 'POST') {
            const { adminId } = body;
            //Could check if admin exist
            const inviteCode = uuidv4();
            const invitesRef = collection(db, "invites");
            await addDoc(invitesRef, {
                code: inviteCode,
                used: false,
                createdBy: adminId,
                createdAt: Timestamp.now(),
            });

            return {
                ok: true,
                status: 201,
                json: async () => ({ code: inviteCode })
            };

        } else if (method === 'PUT') { //cancel
            const { code } = body;

            const invitesRef = collection(db, "invites");
            const q = query(invitesRef, where("code", "==", code));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const inviteDoc = querySnapshot.docs[0];
                await updateDoc(inviteDoc.ref, { used: true });
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({}) // Success, no content needed
                };
            }
            return {
                ok: false,
                status: 404, // Not Found
                json: async () => ({ message: 'Invite not found' }),
                text: async () => 'Invite not found'
            };
        }
    }
    else if (url === '/login/egresso') { //egresso login
        if (method === 'POST') {
            const { username, password } = body;

            const egressosRef = collection(db, "egressos");
            const q = query(egressosRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const egressoData = docSnap.data() as EgressoData & { id: string };

                if (compareHash(password, egressoData.passwordHash)) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ ...egressoData, id: docSnap.id })
                    };
                }
            }
            return {
                ok: false,
                status: 401, // Unauthorized
                json: async () => ({ message: 'Invalid credentials' }),
                text: async () => 'Invalid credentials'
            };
        }

    }
    else if (url === "/login/admin") {
        if (method === 'POST') {
            const { username, password } = body;
            const adminsRef = collection(db, "admins");
            const q = query(adminsRef, where("username", "==", username)); // Query by username
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const adminData = docSnap.data() as AdminData & { id: string };
                if (compareHash(password, adminData.passwordHash)) {
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({ ...adminData, id: docSnap.id })
                    };
                }

            }
            return {
                ok: false,
                status: 401, // Unauthorized
                json: async () => ({ message: 'Invalid credentials' }),
                text: async () => 'Invalid credentials'
            };

        }
    } else if (url === '/email/send' && method === 'POST') {
        // Fake email send as client only and mostly paid services

        const { adminId, ...emailData } = body as EmailSendData & { adminId: string };

        if (!adminId) {
            return { ok: false, status: 400, json: async () => ({ message: "Admin ID is required to send invites." }), text: async () => "Missing adminId" };
        }
        if (!emailData || !Array.isArray(emailData.recipients) || emailData.recipients.length === 0 ||
            !emailData.subject || !emailData.html) { // Check only for HTML as main template now
            return { ok: false, status: 400, json: async () => ({ message: "Missing required fields for sending email" }), text: async () => "Missing email fields" };
        }

        const sendResults = { successfulSends: 0, failedSends: 0, errors: [] as { email: string, error: string }[] };
        console.log(`[ServerFetch /email/send] Simulating email sending process (Fake Send).`);

        for (const recipient of emailData.recipients) {
            let inviteCode = '';
            let inviteLink = '';

            try {
                // 1. Generate a unique invite code for this recipient
                inviteCode = uuidv4();
                const invitesRef = collection(db, "invites");
                await addDoc(invitesRef, {
                    code: inviteCode, used: false, createdBy: adminId, createdAt: Timestamp.now(),
                });

                // 2. Construct the full invite link
                const baseUrl = window.location.origin;
                inviteLink = `${baseUrl}/create-account?invite=${inviteCode}`;

                // 3. Replace placeholders in email body
                const finalBodyHtml = emailData.html.replace(/{link}/g, inviteLink);

                // 4. SIMULATE SENDING (NO ACTUAL SEND)
                console.log(`[Simulation] Would send email to: ${recipient.email}`);
                console.log(`[Simulation] Subject: ${emailData.subject}`);
                console.log(`[Simulation] Invite Link: ${inviteLink}`);
                console.log(`[Simulation] Body Preview:\n ${finalBodyHtml.substring(0, 300)}...`); 

                // 5. SIMULATE SUCCESS/FAILURE
                const simulatedSuccess = Math.random() > 0.05; // Simulate a 95% success rate

                if (simulatedSuccess) {
                    sendResults.successfulSends++;
                    console.log(`[Simulation] Successfully "sent" email to ${recipient.email}.`);
                } else {
                    sendResults.failedSends++;
                    const simulatedError = "Simulated sending failure.";
                    sendResults.errors.push({ email: recipient.email, error: simulatedError });
                    console.error(`[Simulation] Failed to "send" email to ${recipient.email}: ${simulatedError}`);
                }

            } catch (error: any) { // Catch errors from invite generation etc.
                sendResults.failedSends++;
                const errorMessage = `Internal error for ${recipient.email} (e.g., invite generation): ${error.message}`;
                sendResults.errors.push({ email: recipient.email, error: errorMessage });
                console.error(`Error processing email for ${recipient.email}:`, error);
            }
        } // End of recipient loop

        console.log(`[ServerFetch] Email Simulation Complete. Success: ${sendResults.successfulSends}, Failed: ${sendResults.failedSends}`);

        // Return aggregated status (same logic as before)
        if (sendResults.failedSends > 0 && sendResults.successfulSends === 0) {
            // All failed
            return {
                ok: false, status: 500,
                json: async () => ({ message: `All emails failed to send (Simulation). First error: ${sendResults.errors[0]?.error || 'Unknown simulated error'}`, details: sendResults }),
                text: async () => `All emails failed (Simulation). Errors: ${JSON.stringify(sendResults.errors)}`
            };
        } else if (sendResults.failedSends > 0) {
            // Partial success
            return {
                ok: true, status: 207, // Multi-Status
                json: async () => ({ message: `Partially sent emails (Simulation). Success: ${sendResults.successfulSends}, Failed: ${sendResults.failedSends}`, details: sendResults }),
                text: async () => `Partially sent (Simulation). Success: ${sendResults.successfulSends}, Failed: ${sendResults.failedSends}. Errors: ${JSON.stringify(sendResults.errors)}`
            };
        } else {
            // All successful simulation
            return {
                ok: true, status: 200, // Using 200 OK for simulation success
                json: async () => ({ message: 'All invite emails "sent" successfully (Simulation).', details: sendResults }),
                text: async () => `All invite emails "sent" (Simulation). Success: ${sendResults.successfulSends}`
            };
        }
    }

    // Default: Route not found
    return {
        ok: false,
        status: 404,
        json: async () => ({ message: 'Route not found' }),
        text: async () => 'Route not found'
    };
}