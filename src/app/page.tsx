'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type AnalysisResult = {
  product: string
  country: string
  allowed: boolean
  hs_code: string
  tariff: number
  documents: string[]
  pricing: {
    cost: number
    shipping: number
    selling_price: number
    profit: number
    roi: number
  }
  insights: {
    demand: string
    competition: string
    margin: string
    strategy: string
  }
}

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setSaved(false)

    const formData = new FormData(e.currentTarget)

    const data = {
      product: formData.get('product'),
      country: formData.get('country'),
      cost: Number(formData.get('cost')),
      shipping: Number(formData.get('shipping')),
    }

    const res = await fetch('/api/export-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setResult(await res.json())
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)

    const { error } = await supabase.from('reports').insert([
      {
        product: result.product,
        country: result.country,
        cost: result.pricing.cost,
        shipping: result.pricing.shipping,
        profit: result.pricing.profit,
        roi: result.pricing.roi,
      },
    ])

    if (!error) setSaved(true)
    setSaving(false)
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Export Analysis Tool
        </h2>
        <p className="text-sm text-gray-500">
          Calculate profitability and check compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow border space-y-6 md:col-span-1"
        >
          <input name="product" placeholder="Product" required className="w-full border p-2 rounded" />
          <input name="country" placeholder="Country" required className="w-full border p-2 rounded" />
          <input name="cost" type="number" placeholder="Cost" required className="w-full border p-2 rounded" />
          <input name="shipping" type="number" placeholder="Shipping" required className="w-full border p-2 rounded" />

          <button className="w-full bg-indigo-600 text-white py-2 rounded">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Analyze'}
          </button>
        </form>

        {/* RESULT */}
        <div className="md:col-span-2">
          {loading && (
            <div className="text-center p-10">Analyzing...</div>
          )}

          {result && (
            <div className="bg-white p-6 rounded-xl shadow border space-y-4">
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {result.product} → {result.country}
                </h3>

                <button
                  onClick={handleSave}
                  className="border px-3 py-1 rounded"
                >
                  {saved ? (
                    <CheckCircle2 className="text-green-500" />
                  ) : (
                    saving ? 'Saving...' : 'Save'
                  )}
                </button>
              </div>

              <div>
                <p><b>Profit:</b> ${result.pricing.profit}</p>
                <p><b>ROI:</b> {result.pricing.roi}%</p>
                <p><b>Tariff:</b> ${result.tariff}</p>
              </div>

              <div>
                <p><b>Demand:</b> {result.insights.demand}</p>
                <p><b>Competition:</b> {result.insights.competition}</p>
                <p><b>Strategy:</b> {result.insights.strategy}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
