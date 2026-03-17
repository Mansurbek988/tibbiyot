"use client";

import { useState } from "react";
import { Search, MapPin, Clock, Activity, ArrowRight, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { aiService } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [symptoms, setSymptoms] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ specialization: string; confidence: number } | null>(null);
  const router = useRouter();

  const handleTriage = async () => {
    if (!symptoms) return;
    setLoading(true);
    try {
      const response = await aiService.triage(symptoms);
      setResult(response.data);
    } catch (error: any) {
      console.error("Triage error:", error);
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.detail || 
                       (error.response?.data ? JSON.stringify(error.response?.data) : error.message);
      alert(`AI tahlilida xatolik yuz berdi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/doctors?search=${encodeURIComponent(heroSearch)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl font-extrabold leading-tight mb-6">
                Sog'lig'ingiz uchun <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Aqlli Navbat
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                AI yordamida shifokorni aniqlang, navbatga onlayn yoziling va kutish vaqtingizni aniq biling.
              </p>

              <form onSubmit={handleHeroSearch} className="relative mb-8 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Shifokor yoki mutaxassislik..." 
                  className="w-full pl-12 pr-32 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 transition-all">
                  Qidirish
                </button>
              </form>

              <div className="flex gap-4">
                <Link href="/doctors" className="btn-primary flex items-center gap-2">
                  Navbat olish <ArrowRight size={20} />
                </Link>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  Bog'lanish
                </button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={20} /></div>
                  <span className="text-sm font-medium text-gray-500">Xavfsiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg"><Clock size={20} /></div>
                  <span className="text-sm font-medium text-gray-500">Tezkor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><HeartPulse size={20} /></div>
                  <span className="text-sm font-medium text-gray-500">AI Triage</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="card-premium animate-float">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="text-blue-600" /> AI Simptom Tahlili
                  </h3>
                  {loading && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                  {!loading && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">LIVE</span>}
                </div>

                <textarea
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Shikoyatlaringizni yozing (masalan: boshim aylanib, yuragim tez uryapti...)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={loading}
                />

                <button
                  className="w-full mt-4 btn-primary py-3 disabled:opacity-50"
                  onClick={handleTriage}
                  disabled={loading || !symptoms}
                >
                  {loading ? "Tahlil qilinmoqda..." : "AI Tahlil qilish"}
                </button>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl"
                  >
                    <p className="text-sm text-blue-600 font-semibold mb-1">Tavsiya etilgan yo'nalish:</p>
                    <h4 className="text-xl font-bold text-blue-900">{result.specialization}</h4>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-blue-500">Ishonchlilik: {(result.confidence * 100).toFixed(0)}%</span>
                      <Link 
                        href={`/doctors?search=${encodeURIComponent(result.specialization)}`}
                        className="text-sm text-blue-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Mutaxassisni tanlash <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Nega aynan SmartMed Queue?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Tibbiyot muassasalari uchun eng zamonaviy va qulay yechim</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Clock className="text-blue-600" />,
                title: "Aniqlik",
                desc: "AI har bir shifokorning tezligini hisobga olib kutish vaqtini bashorat qiladi."
              },
              {
                icon: <Search className="text-cyan-600" />,
                title: "Oson qidiruv",
                desc: "Maxsus NLP algoritmi simptomlaringizga mos shifokorni o'zi topib beradi."
              },
              {
                icon: <MapPin className="text-indigo-600" />,
                title: "Real-vaqt",
                desc: "Navbat holatini uyingizdan turib real vaqt rejimida kuzatib boring."
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Real-time Stats */}
          <div className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden">
            <div className="relative z-10 grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-black mb-2">24/7</div>
                <div className="text-blue-100 text-sm">Xizmat vaqti</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">150+</div>
                <div className="text-blue-100 text-sm">Malakali shifokorlar</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">12 min</div>
                <div className="text-blue-100 text-sm">O'rtacha kutish</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">98%</div>
                <div className="text-blue-100 text-sm">Mijozlar roziligi</div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
