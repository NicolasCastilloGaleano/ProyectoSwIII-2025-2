import React from 'react';
import type { RiskAlert, AlertSeverity } from '../hooks/useRiskAlerts';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

interface RiskAlertsListProps {
    alerts: RiskAlert[];
}

const severityConfig: Record<AlertSeverity, { color: string; bg: string; icon: React.ElementType }> = {
    info: {
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        icon: InfoOutlinedIcon
    },
    warning: {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        icon: WarningAmberIcon
    },
    critical: {
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        icon: ReportProblemOutlinedIcon
    }
};

const RiskAlertsList: React.FC<RiskAlertsListProps> = ({ alerts }) => {
    if (alerts.length === 0) return null;

    return (
        <div className="space-y-3">
            {alerts.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;

                return (
                    <div
                        key={alert.id}
                        className={`flex items-start gap-3 rounded-xl p-4 ${config.bg} border border-transparent`}
                    >
                        <Icon className={`${config.color} mt-0.5`} fontSize="small" />
                        <div>
                            <p className={`text-sm font-semibold ${config.color}`}>
                                {alert.type === 'critical_mood' ? 'Atención Requerida' :
                                    alert.type === 'sudden_drop' ? 'Cambio Brusco' :
                                        alert.type === 'sustained_low' ? 'Tendencia Baja' : 'Observación'}
                            </p>
                            <p className={`text-sm ${config.color} opacity-90`}>
                                {alert.message}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RiskAlertsList;
