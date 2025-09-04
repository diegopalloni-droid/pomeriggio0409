import React, { useState } from 'react';
import { auth, db } from '../firebase';
// FIX: Remove v9 imports
import { UserRole } from '../types';

export const UserManagement: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.MAGAZZINO);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const username = email.split('@')[0];
        if (!username) {
            setError("Please provide a valid email to generate a username.");
            setLoading(false);
            return;
        }
        
        try {
            // Check if username is already taken
            const existingUserQuery = await db.collection('users').where('username', '==', username).limit(1).get();
            if (!existingUserQuery.empty) {
                throw new Error(`Username "${username}" is already taken.`);
            }

            // Create user with email and password in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (!user) {
              throw new Error("User could not be created.");
            }

            // Add user details (including username and email) to Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                username: username,
                role: role,
            });

            setSuccess(`User ${username} created successfully with role ${role}.`);
            setEmail('');
            setPassword('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-900/40 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700/80">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-200">User Management</h2>
                <button onClick={onBack} className="text-sm font-medium text-slate-300 hover:text-brand-start transition-colors">
                    &larr; Back to Dashboard
                </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
                <div>
                    <label htmlFor="email-create" className="text-sm font-medium text-slate-300 block mb-2">User Email</label>
                    <input
                        id="email-create"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 text-white bg-slate-800/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-start"
                        placeholder="new-user@example.com (username will be 'new-user')"
                        required
                    />
                     <p className="text-xs text-slate-400 mt-1">The username will be automatically generated from the email (part before @).</p>
                </div>
                 <div>
                    <label htmlFor="password-create" className="text-sm font-medium text-slate-300 block mb-2">Password</label>
                    <input
                        id="password-create"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 text-white bg-slate-800/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-start"
                        placeholder="Min. 6 characters"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="role-create" className="text-sm font-medium text-slate-300 block mb-2">Role</label>
                    <select
                        id="role-create"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 text-white bg-slate-800/50 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-start"
                    >
                        <option value={UserRole.MAGAZZINO}>Magazzino</option>
                        <option value={UserRole.FORZA_VENDITA}>Forza Vendita</option>
                        {/* Not allowing creation of more 'responsabile' users from UI */}
                    </select>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
                {success && <p className="text-sm text-green-400">{success}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {loading ? 'Creating...' : 'Create User'}
                </button>
            </form>
        </div>
    );
};