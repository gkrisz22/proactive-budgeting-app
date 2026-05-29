import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

function HealthPage() {
    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const response = await fetch('/api/v1/health');
            if (!response.ok) {
                throw new Error('API is not available');
            }
            return response.json();
        },
        retry: 1,
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30">
            <h1>Proactive Budgeting</h1>
            <Button
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="mt-4"
            >
                {isLoading || isRefetching ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            {data && (
                <div className="mt-4 p-4 bg-slate-800 rounded-md">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-500 text-white rounded-md">
                    <pre>{error.message}</pre>
                </div>
            )}
        </div>
    )
}

export default HealthPage;