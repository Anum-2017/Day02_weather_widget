"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";
import dayImage from "../../public/images/day.jpg";
import nightImage from "../../public/images/night.jpg";

// TypeScript interface for weather data
interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
  localTime: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDayTime, setIsDayTime] = useState<boolean>(true);

  // Handle location search
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );
      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
        localTime: data.location.localtime,
      };
      setWeather(weatherData);

      // Determine if it's day or night based on local time
      const localHour = new Date(weatherData.localTime).getHours();
      setIsDayTime(localHour >= 6 && localHour < 18);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate temperature message
  const getTemperatureMessage = (temperature: number, unit: string): string => {
    if (unit === "C") {
      if (temperature < 0) return `It's freezing at ${temperature}°C! Bundle up!`;
      if (temperature < 10) return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
      if (temperature < 20) return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
      if (temperature < 30) return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`;
      return `It's hot at ${temperature}°C. Stay hydrated!`;
    }
    return `${temperature}°${unit}`;
  };

  // Generate weather message
  const getWeatherMessage = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    const messages: { [key: string]: string } = {
      sunny: "It's a beautiful sunny day!",
      "partly cloudy": "Expect some clouds and sunshine.",
      cloudy: "It's cloudy today.",
      overcast: "The sky is overcast.",
      rain: "Don't forget your umbrella! It's raining.",
      thunderstorm: "Thunderstorms are expected today.",
      snow: "Bundle up! It's snowing.",
      mist: "It's misty outside.",
      fog: "Be careful, there's fog outside.",
    };
    return messages[lowerDesc] || description;
  };

  // Location message based on time
  const getLocationMessage = (location: string): string =>
    `${location} ${isDayTime ? "During the Day" : "at Night"}`;

  // Render weather widget UI
  return (
    <div
      style={{
        backgroundImage: `url(${isDayTime ? dayImage.src : nightImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Weather Widget</CardTitle>
          <CardDescription>
            Search for the current weather conditions in your city.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>

          {error && <div className="mt-4 text-red-500">{error}</div>}
          {weather && (
            <div className="mt-4 grid gap-2">
              <div className="flex items-center gap-2">
                <ThermometerIcon className="w-6 h-6" />
                {getTemperatureMessage(weather.temperature, weather.unit)}
              </div>

              <div className="flex items-center gap-2">
                <CloudIcon className="w-6 h-6" />
                <div>{getWeatherMessage(weather.description)}</div>
              </div>

              <div className="flex items-center gap-2">
                <MapPinIcon className="w-6 h-6" />
                <div>{getLocationMessage(weather.location)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}