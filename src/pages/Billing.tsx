import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Check, AlertTriangle } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { billingApi } from '../api/billing';

export default function Billing() {
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const orgId = 1;

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: () => billingApi.plans(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['billing-subscription', orgId],
    queryFn: () => billingApi.subscription(orgId),
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) =>
      billingApi.checkout({
        org_id: orgId,
        plan,
        success_url: window.location.origin + '/billing?success=true',
        cancel_url: window.location.origin + '/billing?cancelled=true',
      }),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingApi.cancel(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-subscription', orgId] });
      setConfirmCancel(false);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Plans</h1>
        <p className="text-sm dark:text-dark-text-secondary text-light-text-secondary mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-accent" />
            <h2 className="text-sm font-semibold">Current Subscription</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                Plan
              </p>
              <p className="font-semibold mt-1">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                Status
              </p>
              <Badge
                variant={subscription.status === 'active' ? 'success' : 'warning'}
                className="mt-1"
              >
                {subscription.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                Period End
              </p>
              <p className="text-sm mt-1">
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs dark:text-dark-text-secondary text-light-text-secondary">
                Auto-Renew
              </p>
              <Badge
                variant={subscription.cancel_at_period_end ? 'warning' : 'success'}
                className="mt-1"
              >
                {subscription.cancel_at_period_end ? 'Cancelling' : 'Active'}
              </Badge>
            </div>
          </div>

          {/* Cancel */}
          <div className="mt-4 pt-4 border-t dark:border-dark-border border-light-border">
            {confirmCancel ? (
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-amber-400" />
                <span className="text-sm">Are you sure you want to cancel?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => cancelMutation.mutate()}
                  loading={cancelMutation.isPending}
                >
                  Confirm Cancel
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>
                  Keep Subscription
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmCancel(true)}
                className="text-red-500"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Plans Grid */}
      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-4">
                <div className="h-6 rounded dark:bg-dark-border bg-light-border w-24" />
                <div className="h-8 rounded dark:bg-dark-border bg-light-border w-32" />
                <div className="space-y-2">
                  {[...Array(3)].map((__, j) => (
                    <div key={j} className="h-4 rounded dark:bg-dark-border bg-light-border" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.slug}>
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.is_current && <Badge variant="accent">Current</Badge>}
                  </div>
                  <p className="text-2xl font-bold">
                    ${plan.price_monthly}
                    <span className="text-sm font-normal dark:text-dark-text-secondary text-light-text-secondary">
                      /mo
                    </span>
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.is_current ? 'secondary' : 'primary'}
                  disabled={plan.is_current}
                  onClick={() => checkoutMutation.mutate(plan.slug)}
                  loading={checkoutMutation.isPending}
                  className="w-full"
                >
                  {plan.is_current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="dark:text-dark-text-secondary text-light-text-secondary">
              No plans available
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
