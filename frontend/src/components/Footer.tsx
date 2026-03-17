"use client";

import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer id="contact" className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                                T
                            </div>
                            <span className="text-2xl font-black text-gray-900">SmartMed</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed italic">
                            "Sog'lig'ingiz - bizning ustuvor vazifamiz. Zamonaviy texnologiyalar yordamida sifatli tibbiy xizmat."
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-6 text-gray-900">Bo'limlar</h4>
                        <ul className="space-y-4">
                            <li><a href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Asosiy</a></li>
                            <li><a href="/doctors" className="text-gray-500 hover:text-blue-600 transition-colors">Shifokorlar</a></li>
                            <li><a href="/my-queues" className="text-gray-500 hover:text-blue-600 transition-colors">Navbatlarim</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-6 text-gray-900">Aloqa</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-500">
                                <Phone size={18} className="text-blue-600" />
                                <span>+998 90 123 45 67</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Mail size={18} className="text-blue-600" />
                                <span>info@smartmed.uz</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <MapPin size={18} className="text-blue-600" />
                                <span>Toshkent sh., Chilonzor tumani</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-6 text-gray-900">Ijtimoiy tarmoqlar</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-10 text-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} SmartMed Queue System. Barcha huquqlar himoyalangan.
                    </p>
                </div>
            </div>
        </footer>
    );
}
