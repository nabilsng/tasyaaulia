import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";

export default function PortfolioGift({ data }) {
  const { portfolio } = data;
  return (
    <section className="min-h-[100dvh] w-full max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5" />
        <h2 className="text-2xl md:text-3xl font-bold">
          Hadiah untukmu — Mini Portfolio
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {portfolio.map((p, idx) => (
          <Card key={idx} className="hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> {p.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 opacity-90">{p.desc}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tech.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full">
                <a href={p.link} target="_blank" rel="noreferrer">
                  Lihat Project
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
