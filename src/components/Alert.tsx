// src/components/Alert.tsx
import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

interface AlertProps {
    message: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, variant, onClose }) => {
    return (
        <BootstrapAlert variant={variant} onClose={onClose} dismissible>
            {message}
        </BootstrapAlert>
    );
};

export default Alert;