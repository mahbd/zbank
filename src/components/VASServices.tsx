import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Zap, Flame, Droplets, Tv, Shield, GraduationCap, Heart, Car, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface VASService {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  minAmount: number
  maxAmount: number
}

interface VASServicesProps {
  onSelectService: (service: VASService) => void
}

const vasServices: VASService[] = [
  {
    id: 'mobile_recharge',
    name: 'Mobile Recharge',
    description: 'Recharge your mobile phone',
    icon: Smartphone,
    category: 'Communication',
    minAmount: 5,
    maxAmount: 1000
  },
  {
    id: 'electricity_bill',
    name: 'Electricity Bill',
    description: 'Pay your electricity bill',
    icon: Zap,
    category: 'Utilities',
    minAmount: 10,
    maxAmount: 5000
  },
  {
    id: 'gas_bill',
    name: 'Gas Bill',
    description: 'Pay your gas bill',
    icon: Flame,
    category: 'Utilities',
    minAmount: 15,
    maxAmount: 2000
  },
  {
    id: 'water_bill',
    name: 'Water Bill',
    description: 'Pay your water bill',
    icon: Droplets,
    category: 'Utilities',
    minAmount: 10,
    maxAmount: 1000
  },
  {
    id: 'cable_tv',
    name: 'Cable TV',
    description: 'Pay your cable TV subscription',
    icon: Tv,
    category: 'Entertainment',
    minAmount: 20,
    maxAmount: 500
  },
  {
    id: 'internet_bill',
    name: 'Internet Bill',
    description: 'Pay your internet service bill',
    icon: Zap,
    category: 'Utilities',
    minAmount: 25,
    maxAmount: 2000
  },
  {
    id: 'insurance',
    name: 'Insurance Premium',
    description: 'Pay your insurance premium',
    icon: Shield,
    category: 'Insurance',
    minAmount: 50,
    maxAmount: 10000
  },
  {
    id: 'education_fees',
    name: 'Education Fees',
    description: 'Pay school/college fees',
    icon: GraduationCap,
    category: 'Education',
    minAmount: 100,
    maxAmount: 50000
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Pay medical bills',
    icon: Heart,
    category: 'Healthcare',
    minAmount: 50,
    maxAmount: 100000
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Pay for transportation services',
    icon: Car,
    category: 'Transport',
    minAmount: 10,
    maxAmount: 5000
  }
]

export function VASServices({ onSelectService }: VASServicesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const categories = [...new Set(vasServices.map(service => service.category))]

  return (
    <section className="mb-8">
      <div 
        className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="vas-services-toggle"
      >
        <h2 className="text-2xl font-semibold" data-testid="vas-services-title">
          Value Added Services
        </h2>
        <Button variant="ghost" size="sm" className="p-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-6">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-medium mb-4 text-gray-700">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {vasServices
                  .filter(service => service.category === category)
                  .map(service => {
                    const IconComponent = service.icon
                    return (
                      <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`vas-service-${service.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <IconComponent className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{service.name}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          <div className="text-xs text-gray-500 mb-3">
                            Amount: ${service.minAmount} - ${service.maxAmount}
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectService(service)
                            }}
                            data-testid={`pay-vas-${service.id}`}
                          >
                            Pay Now
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}