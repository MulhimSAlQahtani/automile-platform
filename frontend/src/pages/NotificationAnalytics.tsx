import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Megaphone, TrendingUp, Users, Target, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const abData = [
  { name: 'Group A (Urgent)', value: 45 },
  { name: 'Group B (Friendly)', value: 55 },
];
const COLORS = ['#ef4444', '#3b82f6'];

const ctrData = [
  { name: 'Mon', A: 4000, B: 2400 },
  { name: 'Tue', A: 3000, B: 1398 },
  { name: 'Wed', A: 2000, B: 9800 },
  { name: 'Thu', A: 2780, B: 3908 },
  { name: 'Fri', A: 1890, B: 4800 },
  { name: 'Sat', A: 2390, B: 3800 },
  { name: 'Sun', A: 3490, B: 4300 },
];

const timeOptimizationData = [
  { hour: 8, ctr: 120, z: 200 },
  { hour: 12, ctr: 98, z: 260 },
  { hour: 17, ctr: 250, z: 400 }, // Peak after-work engagement block
  { hour: 20, ctr: 140, z: 280 },
];

export default function NotificationAnalytics() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto animate-slide-up pb-24">
      {/* Heavy Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
             <Megaphone className="w-5 h-5 text-primary" /> Delivery Intel
          </h1>
          <p className="text-xs text-muted-foreground">FCM Engagement & CTR Optimization</p>
        </div>
      </div>

      {/* Global Campaign KPIs */}
      <div className="grid grid-cols-3 gap-2">
         <div className="p-3 bg-secondary/30 rounded-xl border border-border flex flex-col items-center justify-center gap-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-lg font-black text-foreground">14.2k</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">Total Sent</span>
         </div>
         <div className="p-3 bg-success/10 rounded-xl border border-success/30 flex flex-col items-center justify-center gap-1">
            <Target className="w-4 h-4 text-success" />
            <span className="text-lg font-black text-success">24.8%</span>
            <span className="text-[9px] font-bold text-success/70 uppercase tracking-widest text-center">Avg CTR</span>
         </div>
         <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 flex flex-col items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-lg font-black text-primary">5:30 PM</span>
            <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest text-center">Peak Hour</span>
         </div>
      </div>

      {/* A/B Campaign Splitting Matrix */}
      <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A/B Tone Conversion Spread</h3>
        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={abData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                 {abData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
               <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--secondary))', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
               />
             </PieChart>
           </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-between items-center px-4">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-xs font-bold text-foreground">Group A (Urgent)</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-foreground">Group B (Friendly)</span>
           </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground text-center mt-2 px-4 shadow-sm">
           <strong>Insight:</strong> The "Friendly" tone format yields an 18.1% higher likelihood of tapping the Deep Link vs the "Critical" alarm string. We advise skewing 70/30 favoring Group B format for Winter Tire reminders.
        </p>
      </div>

      {/* Weekly CTR Trajectories via Recharts */}
      <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">7-Day Trajectory Mapping (M-S)</h3>
        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={ctrData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
               <YAxis hide />
               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--secondary))', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
               <Bar dataKey="A" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
               <Bar dataKey="B" fill="#3b82f6" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Optimum Delivery Schedule Optimization (Scatter Protocol) */}
      <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Engagement Temporal Density</h3>
        <div className="h-40 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <ScatterChart>
               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
               <XAxis type="number" dataKey="hour" name="Hour of Day" unit=":00" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 24]} />
               <YAxis type="number" dataKey="ctr" name="Interactions" hide />
               <ZAxis type="number" dataKey="z" range={[60, 400]} />
               <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: 'hsl(var(--secondary))', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
               <Scatter name="Ping Density" data={timeOptimizationData} fill="hsl(var(--primary))" />
             </ScatterChart>
           </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
           A massive spike identically occurs at <strong>17:00 (5:00 PM)</strong>. Users exiting the physical workplace possess maximum psychological bandwidth to authorize financial component replacements.
        </p>
      </div>

    </div>
  );
}
