import { Link } from 'react-router'

function LoginPage() {

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      <h1>Proactive Budgeting</h1>
      <Link to="/health" className='text-blue-500 underline hover:no-underline'>Health</Link>
    </div>
  )
}

export default LoginPage
