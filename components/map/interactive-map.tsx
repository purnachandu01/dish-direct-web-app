"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Clock, Phone, Navigation } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  cuisine: string
  rating: number
  verified: boolean
  phone?: string
  openHours?: string
  donationsReceived: number
  tokensAvailable: number
  distance?: number
}

interface InteractiveMapProps {
  userLocation?: { lat: number; lng: number }
  restaurants: Restaurant[]
  onRestaurantSelect: (restaurant: Restaurant) => void
}

export function InteractiveMap({ userLocation, restaurants, onRestaurantSelect }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  useEffect(() => {
    // Initialize Leaflet map
    const initMap = async () => {
      if (typeof window !== "undefined" && mapRef.current) {
        const L = (await import("leaflet")).default

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/map-marker-icon.png",
          iconUrl: "/map-marker-icon.png",
          shadowUrl: "/map-shadow.jpg",
        })

        const map = L.map(mapRef.current).setView(
          userLocation ? [userLocation.lat, userLocation.lng] : [18.1124, 83.3956], // Default to Vizianagaram
          13,
        )

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        if (userLocation) {
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: `
              <div class="relative">
                <div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                <div class="absolute inset-0 w-6 h-6 bg-blue-500/30 rounded-full animate-ping"></div>
                <div class="absolute -top-1 -left-1 w-8 h-8 border-2 border-blue-500/50 rounded-full"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-2">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <strong>Your Location</strong>
                </div>
                <p class="text-sm text-gray-600">Lat: ${userLocation.lat.toFixed(4)}</p>
                <p class="text-sm text-gray-600">Lng: ${userLocation.lng.toFixed(4)}</p>
              </div>
            `)
        }

        // Add restaurant markers
        restaurants.forEach((restaurant) => {
          const restaurantIcon = L.divIcon({
            className: "restaurant-marker",
            html: `
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full border-3 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                ${
                  restaurant.verified
                    ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>'
                    : ""
                }
                ${restaurant.distance ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">${restaurant.distance.toFixed(1)}km</div>` : ""}
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })

          L.marker([restaurant.lat, restaurant.lng], { icon: restaurantIcon })
            .addTo(map)
            .on("click", () => {
              setSelectedRestaurant(restaurant)
              onRestaurantSelect(restaurant)
            })
            .bindPopup(`
              <div class="p-3 min-w-[200px]">
                <div class="flex items-center gap-2 mb-2">
                  <strong class="text-lg">${restaurant.name}</strong>
                  ${restaurant.verified ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">✓ Verified</span>' : ""}
                </div>
                <p class="text-sm text-gray-600 mb-2">${restaurant.address}</p>
                <div class="flex items-center gap-3 text-sm mb-2">
                  <span class="flex items-center gap-1">⭐ ${restaurant.rating}</span>
                  <span class="text-blue-600">${restaurant.cuisine}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Donations: <strong>${restaurant.donationsReceived}</strong></span>
                  <span>Tokens: <strong>${restaurant.tokensAvailable}</strong></span>
                </div>
              </div>
            `)
        })

        setMapInstance(map)
      }
    }

    initMap()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [userLocation, restaurants, onRestaurantSelect])

  const centerOnUser = () => {
    if (mapInstance && userLocation) {
      mapInstance.setView([userLocation.lat, userLocation.lng], 15)
    }
  }

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {userLocation && (
        <Button
          onClick={centerOnUser}
          size="icon"
          className="absolute top-4 right-4 z-[1000] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      )}

      {/* Restaurant info popup */}
      {selectedRestaurant && (
        <Card className="absolute bottom-4 left-4 right-4 glassmorphism border-white/20 p-4 z-[1000]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">{selectedRestaurant.name}</h3>
                {selectedRestaurant.verified && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-white/70 mb-2">{selectedRestaurant.address}</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{selectedRestaurant.rating}</span>
                </div>
                {selectedRestaurant.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{selectedRestaurant.phone}</span>
                  </div>
                )}
                {selectedRestaurant.openHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRestaurant.openHours}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/10"
              onClick={() => setSelectedRestaurant(null)}
            >
              ×
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-white/60">Donations: </span>
                <span className="text-primary font-medium">{selectedRestaurant.donationsReceived}</span>
              </div>
              <div>
                <span className="text-white/60">Tokens: </span>
                <span className="text-secondary font-medium">{selectedRestaurant.tokensAvailable}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Heart className="w-4 h-4 mr-1" />
                Donate
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Redeem
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
