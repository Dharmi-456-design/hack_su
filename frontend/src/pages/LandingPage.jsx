import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Settings, BarChart3, Package, Bell, LineChart, 
  Cpu, BrainCircuit, ArrowRight, Zap, ShieldCheck, Factory,
  ChevronRight, Database, Workflow
} from 'lucide-react';

export default function LandingPage() {
  // Smooth scroll for anchor links
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-600/20 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-blue-400/10 blur-[80px]"></div>
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMGg0MHYxSDB6TTAgMGgxdjQwSDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-900/70 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <Factory size={18} />
              </div>
              <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                SMARTFACTORY
              </span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                <a href="#home" className="hover:text-blue-400 transition-colors px-3 py-2 text-sm font-medium">Home</a>
                <a href="#features" className="hover:text-blue-400 transition-colors px-3 py-2 text-sm font-medium">Features</a>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors px-3 py-2 text-sm font-medium">Workflow</a>
                <a href="#dashboard" className="hover:text-blue-400 transition-colors px-3 py-2 text-sm font-medium">Dashboard</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/" className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] border border-blue-500">
                Explore App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Industry 4.0 Platform Standard
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 mt-4">
          AI Powered <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-green-400">
            Smart Factory Management
          </span>
        </h1>
        
        <p className="mt-4 text-xl text-slate-400 max-w-3xl mb-10 leading-relaxed font-light">
          Revolutionize your production floor with real-time machine monitoring, predictive maintenance, and AI-driven analytics. Build the factory of the future today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] group">
            Explore Dashboard
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/10 backdrop-blur-sm">
            Login to Account
          </Link>
        </div>

        {/* Floating Dashboard Preview (Hero Image) */}
        <div className="mt-20 w-full max-w-5xl relative group perspective-[2000px]">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-blue-500 to-green-500 opacity-20 blur-xl group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] hover:rotate-[1deg]">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" alt="Factory Interface" className="w-full h-auto opacity-80 mix-blend-luminosity border-b border-slate-800" />
            
            {/* Overlay mock UI elements */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg p-3 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center text-green-400"><Activity size={20}/></div>
                <div>
                  <div className="text-xs text-slate-400">Overall OEE</div>
                  <div className="text-xl font-bold text-white">94.2%</div>
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg p-3 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-400"><Output size={20}/></div>
                <div>
                  <div className="text-xs text-slate-400">Active Machines</div>
                  <div className="text-xl font-bold text-white">12 / 12</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-slate-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Intelligent Capabilities</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our platform integrates seamlessly with your existing hardware to provide unprecedented visibility and control.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: 'Machine Health', desc: 'Real-time telemetry and condition monitoring for all your critical assets.', color: 'blue' },
              { icon: Settings, title: 'Predictive Maint.', desc: 'AI models predict failures before they happen, reducing unplanned downtime.', color: 'orange' },
              { icon: BarChart3, title: 'Production Tracking', desc: 'Live yield metrics, cycle times, and OEE calculations across all shifts.', color: 'green' },
              { icon: Package, title: 'Inventory Automation', desc: 'Smart material flow tracking and automated reordering workflows.', color: 'purple' },
              { icon: Bell, title: 'Smart Alert System', desc: 'Context-aware notifications sent instantly to the right personnel.', color: 'red' },
              { icon: LineChart, title: 'Analytics Dashboard', desc: 'Deep insights with customizable reports and historical trend analysis.', color: 'cyan' },
            ].map((feature, idx) => (
              <div key={idx} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm shadow-lg">
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center text-${feature.color}-400 mb-4 border border-${feature.color}-500/30 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">From raw metrics to automated decisions in three simple steps.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-green-500/0"></div>

            {[
              { icon: Database, title: 'Collect Data', desc: 'Sensors on your machines securely stream telemetry and condition data in real-time to our cloud infrastructure.' },
              { icon: BrainCircuit, title: 'AI Analysis', desc: 'Proprietary machine learning models continuously analyze the unstructured data to detect anomalies and patterns.' },
              { icon: Workflow, title: 'Smart Decisions', desc: 'The system automatically triggers alerts, schedules maintenance, and adjusts parameters to optimize yield.' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex-1 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-blue-500/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <step.icon size={36} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-transparent to-blue-950/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-green-600/20 border border-white/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 blur-[80px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/20 blur-[80px] rounded-full"></div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white relative z-10">Start Smart Manufacturing Today</h2>
            <p className="text-xl text-blue-200 mb-10 relative z-10 font-light max-w-2xl mx-auto">
              Ready to transform your factory floor? Join industry leaders using our platform to optimize production and reduce downtime.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                Launch Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 py-12 border-t border-white/5 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/50">
                  <Factory size={16} />
                </div>
                <span className="font-bold text-lg tracking-wider text-white">
                  SMARTFACTORY
                </span>
              </div>
              <p className="text-sm">Powering the next generation of industrial automation with AI and IoT.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Machine Health</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Predictive Maintenance</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Analytics API</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog & News</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Sales</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; {new Date().getFullYear()} SmartFactory AI Automation. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/login" className="hover:text-white transition-colors">Login Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icon fallbacks (if lucide-react is missing these)
function Output(props) {
  return <Cpu {...props} />;
}
