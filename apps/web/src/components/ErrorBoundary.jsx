import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="card" style={{ padding: 20, margin: 20, color: 'crimson' }}>
                    <h3>Что-то пошло не так</h3>
                    <p>Попробуйте обновить страницу или повторить действие позже.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
