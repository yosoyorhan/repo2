import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Bir hata oluştu.</h2>
          <p className="text-sm text-gray-600">Sayfayı yenilemeyi deneyin veya yayını yeniden başlatın.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
