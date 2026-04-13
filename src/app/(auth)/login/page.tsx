import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-rosa-800">NutricionRosa</h1>
        <p className="text-rosa-600 mt-2">Plataforma Nutricional Corporativa</p>
      </div>
      <LoginForm />
    </div>
  )
}
