import { Zap } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="size-5 fill-primary text-primary" />
              Social-Copilot
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered social media management for modern creators and teams.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Platforms</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Instagram</li>
              <li>Twitter / X</li>
              <li>LinkedIn</li>
              <li>YouTube</li>
              <li>+ 5 more</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Jobos Technologies LLC. All rights reserved.
          <span className="mx-1.5">·</span>
          Social-Copilot is a product of Jobos Technologies LLC.
        </div>
      </div>
    </footer>
  );
}
