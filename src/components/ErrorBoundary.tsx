import React from 'react'

type State = { error: Error | null }

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: any) {
    // Could log to an external service here
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.error)
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: 'tomato' }}>{String(this.state.error)}</pre>
        </div>
      )
    return this.props.children
  }
}
