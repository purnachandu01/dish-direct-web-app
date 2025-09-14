"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Star, MapPin, CreditCard, Gift, Zap } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  address: string
  cuisine: string
  rating: number
  verified: boolean
}

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant | null
  onDonationComplete: (donation: any) => void
}

const DONATION_AMOUNTS = [5, 10, 25, 50, 100]

export function DonationModal({ isOpen, onClose, restaurant, onDonationComplete }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorMessage, setDonorMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const finalAmount = selectedAmount || Number.parseFloat(customAmount) || 0
  const tokensToEarn = Math.floor(finalAmount / 5) // 1 token per $5
  const scratchCardsToEarn = Math.floor(finalAmount / 10) // 1 scratch card per $10

  const handleDonate = async () => {
    if (finalAmount < 5) return

    setIsProcessing(true)

    try {
      // TODO: Integrate with Stripe
      const donationData = {
        restaurantId: restaurant?.id,
        amount: finalAmount,
        tokens: tokensToEarn,
        scratchCards: scratchCardsToEarn,
        isAnonymous,
        message: donorMessage,
        timestamp: new Date().toISOString(),
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onDonationComplete(donationData)
      onClose()
    } catch (error) {
      console.error("Donation failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setSelectedAmount(null)
    setCustomAmount("")
    setIsAnonymous(false)
    setDonorMessage("")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent className="glassmorphism border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Donate Meals</DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            Support {restaurant?.name} and earn rewards
          </DialogDescription>
        </DialogHeader>

        {restaurant && (
          <Card className="glassmorphism border-white/20 p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{restaurant.name}</h3>
                  {restaurant.verified && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Verified</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-white/70 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{restaurant.rating}</span>
                  <span className="mx-1">•</span>
                  <span>{restaurant.cuisine}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {/* Amount selection */}
          <div>
            <Label className="text-white mb-3 block">Select donation amount</Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {DONATION_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={
                    selectedAmount === amount
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                  }
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-white/50">$</span>
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-primary"
                min="5"
                step="1"
              />
            </div>
          </div>

          {/* Rewards preview */}
          {finalAmount >= 5 && (
            <Card className="glassmorphism border-white/20 p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                You'll earn
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Meal Tokens</span>
                  <span className="text-primary font-medium">{tokensToEarn}</span>
                </div>
                {scratchCardsToEarn > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Scratch Cards</span>
                    <span className="text-secondary font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {scratchCardsToEarn}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-white mb-2 block">
              Message (optional)
            </Label>
            <Input
              id="message"
              placeholder="Add a message of hope..."
              value={donorMessage}
              onChange={(e) => setDonorMessage(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-primary"
              maxLength={100}
            />
          </div>

          {/* Anonymous option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="anonymous" className="text-sm text-white/70">
              Make this donation anonymous
            </Label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              disabled={finalAmount < 5 || isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground ripple-effect"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Donate ${finalAmount}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
