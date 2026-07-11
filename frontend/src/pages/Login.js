import React from 'react';
import { FaGithub } from 'react-icons/fa';

function Login() {
    const handleLogin = () => {
        const backendUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://127.0.0.1:8000"
            : "";
        window.location.href = `${backendUrl}/api/auth/github/login/`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <FaGithub size={60} style={styles.logo} />
                </div>
                <h1 style={styles.title}>GitHub Automation Bot</h1>
                <p style={styles.subtitle}>
                    Synchronize your repositories, monitor events with webhooks, and automate workflow notifications in real time.
                </p>
                <button onClick={handleLogin} style={styles.button}>
                    <FaGithub size={20} style={styles.buttonIcon} />
                    Login with GitHub
                </button>
                <div style={styles.footer}>
                    Secure OAuth Authentication via GitHub
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #312e81)',
        padding: '20px',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        animation: 'fadeIn 0.6s ease',
    },
    logoContainer: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    logo: {
        color: '#6366f1',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '15px',
        background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '15px',
        color: '#94a3b8',
        lineHeight: '1.6',
        marginBottom: '35px',
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px 24px',
        background: '#6366f1',
        color: '#ffffff',
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
    },
    buttonIcon: {
        color: '#ffffff',
    },
    footer: {
        marginTop: '25px',
        fontSize: '12px',
        color: '#64748b',
    }
};

export default Login;