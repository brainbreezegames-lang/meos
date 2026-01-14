'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import CTAButton from '@/components/ui/CTAButton';

export default function PricingCards() {
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid'>('paid');

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Plan Switcher */}
            <div className="flex gap-4 mb-8">
                <div
                    onClick={() => setSelectedPlan('free')}
                    className={`flex-1 p-4 border rounded cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-[#EB9D2A] bg-[#EB9D2A]/5 ring-1 ring-[#EB9D2A]' : 'border-[#BFC1B7] hover:border-[#73756B] bg-white'}`}
                >
                    <h4 className="text-[15px] font-bold text-[#23251D] mb-1">Free</h4>
                    <p className="text-[13px] text-[#73756B]">Free - no credit card required</p>
                </div>

                <div
                    onClick={() => setSelectedPlan('paid')}
                    className={`flex-1 p-4 border rounded cursor-pointer transition-all ${selectedPlan === 'paid' ? 'border-[#EB9D2A] bg-[#EB9D2A]/5 ring-1 ring-[#EB9D2A]' : 'border-[#BFC1B7] hover:border-[#73756B] bg-white'}`}
                >
                    <h4 className="text-[15px] font-bold text-[#23251D] mb-1">Pay-as-you-go</h4>
                    <p className="text-[13px] text-[#73756B]">Usage-based pricing with generous free tier</p>
                </div>
            </div>

            {/* Pricing Details */}
            <div className="grid md:grid-cols-2 gap-8">

                {/* Card 1: Included */}
                <div className="bg-[#FDFDF8] border border-[#E5E7E0] rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">What needs to be included in {selectedPlan === 'free' ? 'Free' : 'Pro'}?</h3>
                    <ul className="space-y-3">
                        {[
                            '1,000,000 events/mo free',
                            '5,000 recordings/mo free',
                            'Unlimited members',
                            'All platform features',
                            'Community support'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-[14px] text-[#4D4F46]">
                                <Check size={16} className="text-[#6AA84F] mt-0.5 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                        {selectedPlan === 'paid' && (
                            <>
                                <li className="flex items-start gap-3 text-[14px] text-[#4D4F46]">
                                    <Check size={16} className="text-[#6AA84F] mt-0.5 shrink-0" />
                                    <span>Priority support options</span>
                                </li>
                                <li className="flex items-start gap-3 text-[14px] text-[#4D4F46]">
                                    <Check size={16} className="text-[#6AA84F] mt-0.5 shrink-0" />
                                    <span>SAML SSO (Enterprise)</span>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Card 2: Calculator/CTA */}
                <div className="flex flex-col justify-center items-center text-center p-6 bg-white border border-[#BFC1B7] rounded-lg shadow-sm">
                    <h3 className="text-2xl font-bold mb-2">
                        {selectedPlan === 'free' ? 'Always Free' : 'Start building'}
                    </h3>
                    <p className="text-[#65675E] mb-6">
                        {selectedPlan === 'free'
                            ? 'Perfect for hobby projects and early stage startups.'
                            : 'Scale with your users. First 1M events are always free.'}
                    </p>

                    <CTAButton href="/signup" size="large" className="w-full max-w-[200px] mb-4">
                        Get started - free
                    </CTAButton>

                    <p className="text-xs text-[#9EA096]">
                        No credit card required for the free volume.
                    </p>
                </div>

            </div>
        </div>
    );
}
