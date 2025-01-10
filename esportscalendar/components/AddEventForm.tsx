import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Event } from '../types/event'
import { useAuth } from '@/contexts/AuthContext'
import { countries } from '../utils/countries'
import { getCountryFlagUrl } from '../utils/countryFlags'
import Image from 'next/image'
import axios from 'axios';

const fetchTimeseriesData = () => {
  const options = {
    method: "GET",
    url: "https://api.fxratesapi.com/timeseries",
    params: {
      start_date: "2024-12-24T17:31:37.526Z",
      end_date: "2025-01-07T17:31:37.526Z"
    }
  };

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
};

const fetchHistoricalData = () => {
  const options = {
    "method": "GET",
    "url": "https://api.fxratesapi.com/historical?api_key=fxr_demo_asdiksd21&date=2020-01-01&base=USD&currencies=EUR,GBP,JPY&resolution=1m&amount=1&places=6&format=json"
  };

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
};

const fetchConvertData = () => {
  const options = {
    "method": "GET",
    "url": "https://api.fxratesapi.com/convert?from=GBP&to=EUR&date=2012-06-24&amount=234.12&format=json"
  };

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
};

const fetchLatestRates = async () => {
  const options = {
    "method": "GET",
    "url": "https://api.fxratesapi.com/latest?base=EUR&currencies=USD,GBP,JPY,SEK,PLN&resolution=1m&amount=1&places=6&format=json"
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchCurrencies = () => {
  const options = {
    "method": "GET",
    "url": "https://api.fxratesapi.com/currencies"
  };

  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
};

const STORAGE_KEY = 'persistentClientList';

interface AddEventFormProps {
  onAddEvent: (event: Event) => void
  selectedMonth: number | null
}

export function AddEventForm({ onAddEvent, selectedMonth }: AddEventFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    userId: user?.id || 0,
    name: '',
    client: '',
    game: '',
    startDate: '',
    endDate: '',
    numberOfDays: 0,
    city: '',
    country: '',
    rate: 0,
    travelRate: 0,
    budgeted: 0,
    finalPaidAmount: 0,
    observations: '',
    status: 'Nothing', 
    invoice: false,
    receipt: false,
  })

  const [minEndDate, setMinEndDate] = useState('')
  const [clientList, setClientList] = useState<string[]>(() => {
    const storedList = localStorage.getItem(STORAGE_KEY);
    return storedList ? JSON.parse(storedList) : [];
  });
  const [selectedClient, setSelectedClient] = useState('')
  const [currency, setCurrency] = useState('€')
  const [totalInEuros, setTotalInEuros] = useState<number>(0);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const startDateInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (selectedMonth !== null) {
    const currentYear = new Date().getFullYear();
    // Crie a data no UTC para evitar problemas de fuso horário
    const selectedDate = new Date(Date.UTC(currentYear, selectedMonth, 1));
    // Formate a data para YYYY-MM-DD, garantindo que usamos o dia 1
    const formattedDate = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-01`;
    setFormData(prev => ({
      ...prev,
      startDate: formattedDate
    }));

    if (startDateInputRef.current) {
      startDateInputRef.current.focus();
    }
  }
}, [selectedMonth]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Adicionamos 1 para incluir o dia de início e o dia de término
      console.log(`Add Event - Start: ${formData.startDate}, End: ${formData.endDate}, Days: ${diffDays}`)
      setFormData(prev => ({ ...prev, numberOfDays: diffDays }))
    }
  }, [formData.startDate, formData.endDate])

  useEffect(() => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate)
      setMinEndDate(startDate.toISOString().split('T')[0])
    
      if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        setFormData(prev => ({ ...prev, endDate: formData.startDate }))
      }
    }
  }, [formData.startDate])


  useEffect(() => {
    const convertToEuros = (amount: number, fromCurrency: string) => {
      if (fromCurrency === '€' || fromCurrency === 'EUR') return amount;
      const rate = exchangeRates[fromCurrency] || 1;
      return amount / rate; // Dividimos pelo rate em vez de multiplicar
    };

    setTotalInEuros(convertToEuros(formData.budgeted, currency));
  }, [formData.budgeted, currency, exchangeRates]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await fetchLatestRates();
        if (data && data.rates) {
          setExchangeRates(data.rates);
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    fetchRates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'rate' || name === 'travelRate' || name === 'budgeted') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  const handleCheckboxChange = (name: 'invoice' | 'receipt') => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddEvent({
      ...formData,
      id: Date.now(),
      userId: user?.id || 0,
      currency: currency,
    } as Event)
  
    if (formData.client) {
      addClientToList(formData.client);
    }
  
    setFormData({
      userId: user?.id || 0,
      name: '',
      client: '',
      game: '',
      startDate: '',
      endDate: '',
      numberOfDays: 0,
      city: '',
      country: '',
      rate: 0,
      travelRate: 0,
      budgeted: 0,
      finalPaidAmount: 0,
      observations: '',
      status: 'Nothing', 
      invoice: false,
      receipt: false,
    })
    setSelectedClient('')
  }

  const isOnlineEvent = formData.country === 'Online'

  const addClientToList = (client: string) => {
    if (client && !clientList.includes(client)) {
      const newList = [...clientList, client];
      setClientList(newList);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
  }

  const handleDateInputClick = () => {
    if (startDateInputRef.current) {
      try {
        startDateInputRef.current.showPicker();
      } catch (error) {
        console.log('showPicker is not supported in this browser or environment');
      }
    }
  };

  useEffect(() => {
    const finalQuote = (formData.travelRate * 2) + (formData.rate * formData.numberOfDays);
    setFormData(prev => ({ ...prev, budgeted: finalQuote }));
  }, [formData.travelRate, formData.rate, formData.numberOfDays]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">State</Label>
        <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="bg-gray-700 text-gray-100 w-40">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nothing">Nothing</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="In Contact">In Contact</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name of the event</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-gray-700 text-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <div className="flex space-x-2 items-center">
            <Input
              id="client"
              name="client"
              value={formData.client}
              onChange={(e) => {
                const value = e.target.value
                setFormData(prev => ({ ...prev, client: value }))
                console.log(`Client updated to: ${value}`)
              }}
              required
              className="bg-gray-700 text-gray-100 flex-grow"
            />
            <Select
              value={selectedClient}
              onValueChange={(value) => {
                setSelectedClient(value)
                setFormData(prev => ({ ...prev, client: value }))
              }}
            >
              <SelectTrigger className="bg-gray-700 text-gray-100 w-40">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clientList.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="game">Game</Label>
          <Input id="game" name="game" value={formData.game} onChange={handleChange} required className="bg-gray-700 text-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Travel In</Label>
          <Input 
            id="startDate" 
            name="startDate" 
            type="date" 
            value={formData.startDate} 
            onChange={handleChange} 
            onClick={handleDateInputClick}
            required 
            className="bg-gray-700 text-gray-100 cursor-pointer" 
            ref={startDateInputRef}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Travel Out</Label>
          <Input 
            id="endDate" 
            name="endDate" 
            type="date" 
            value={formData.endDate} 
            onChange={handleChange} 
            min={minEndDate}
            required 
            className="bg-gray-700 text-gray-100" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numberOfDays">Number of days</Label>
          <Input id="numberOfDays" name="numberOfDays" type="number" value={formData.numberOfDays} readOnly className="bg-gray-700 text-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            name="country"
            value={formData.country}
            onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
          >
            <SelectTrigger className="bg-gray-700 text-gray-100">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  <div className="flex items-center">
                    <Image
                      src={getCountryFlagUrl(country)}
                      alt={`${country} flag`}
                      width={20}
                      height={15}
                      className="mr-2 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://www.hltv.org/img/static/flags/30x20/WORLD.gif';
                      }}
                    />
                    {country}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input 
            id="city" 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            required={!isOnlineEvent}
            className="bg-gray-700 text-gray-100" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="travelRate">Travel Rate</Label>
          <Input id="travelRate" name="travelRate" type="number" value={formData.travelRate} onChange={handleChange} required className="bg-gray-700 text-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Work Rate</Label>
          <Input id="rate" name="rate" type="number" value={formData.rate} onChange={handleChange} required className="bg-gray-700 text-gray-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budgeted">Final quote</Label>
          <Input 
            id="budgeted" 
            name="budgeted" 
            type="number" 
            value={formData.budgeted} 
            onChange={handleChange}
            className="bg-gray-700 text-gray-100" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <div className="flex items-center space-x-2">
            <Select name="currency" value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-gray-700 text-gray-100 w-24">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">€ (EUR)</SelectItem>
                <SelectItem value="USD">$ (USD)</SelectItem>
                {['SEK', 'PLN'].map(rate => (
                  <SelectItem key={rate} value={rate}>{rate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-gray-400 text-sm">
              Total in Euros €{totalInEuros.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="space-y-2 hidden">
          <Label htmlFor="finalPaidAmount">Amount Paid</Label>
          <Input id="finalPaidAmount" name="finalPaidAmount" type="number" value={formData.finalPaidAmount} onChange={handleChange} required className="bg-gray-700 text-gray-100" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observations">Obs.</Label>
        <Textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} className="bg-gray-700 text-gray-100" />
      </div>
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="invoice" 
            checked={formData.invoice} 
            onCheckedChange={() => handleCheckboxChange('invoice')}
          />
          <Label htmlFor="invoice">Invoice</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="receipt" 
            checked={formData.receipt} 
            onCheckedChange={() => handleCheckboxChange('receipt')}
          />
          <Label htmlFor="receipt">Receipt</Label>
        </div>
      </div>
      <Button type="submit" className="w-full">Add event!</Button>
    </form>
  )
}

