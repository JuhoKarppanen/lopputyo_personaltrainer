import React from 'react'

type State = { error: Error | null }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(_error: Error, _info: any) {
    
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
