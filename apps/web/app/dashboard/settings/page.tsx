"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save, RefreshCw, Bot, Mail, Clock } from "lucide-react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface BotSettings {
  DISCORD_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_GUILD_ID: string;
  DISCORD_CHANNEL_ID: string;
  EMAIL_SERVER_HOST: string;
  EMAIL_SERVER_PORT: string;
  EMAIL_SERVER_USER: string;
  EMAIL_SERVER_PASSWORD: string;
  EMAIL_FROM: string;
  TESTFLIGHT_CHECK_INTERVAL: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession({
    required: true,
  });
  const [settings, setSettings] = useState<BotSettings>({
    DISCORD_TOKEN: '',
    DISCORD_CLIENT_ID: '',
    DISCORD_GUILD_ID: '',
    DISCORD_CHANNEL_ID: '',
    EMAIL_SERVER_HOST: '',
    EMAIL_SERVER_PORT: '',
    EMAIL_SERVER_USER: '',
    EMAIL_SERVER_PASSWORD: '',
    EMAIL_FROM: '',
    TESTFLIGHT_CHECK_INTERVAL: '300000',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      redirect('/');
    }

    fetchSettings();
  }, [session, status]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setError('Failed to fetch settings');
      }
    } catch (error) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (error) {
      setError('Failed to update settings');
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof BotSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-2 text-slate-700 dark:text-slate-300">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Bot Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure your Discord bot and email settings
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-400">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Discord Settings */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Bot className="h-5 w-5" />
                Discord Bot Configuration
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Configure your Discord bot connection and server settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discord-token" className="text-slate-700 dark:text-slate-300 font-medium">
                    Discord Bot Token
                  </Label>
                  <Input
                    id="discord-token"
                    type="password"
                    value={settings.DISCORD_TOKEN}
                    onChange={(e) => handleInputChange('DISCORD_TOKEN', e.target.value)}
                    placeholder="Bot token from Discord Developer Portal"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-client-id" className="text-slate-700 dark:text-slate-300 font-medium">
                    Discord Client ID
                  </Label>
                  <Input
                    id="discord-client-id"
                    value={settings.DISCORD_CLIENT_ID}
                    onChange={(e) => handleInputChange('DISCORD_CLIENT_ID', e.target.value)}
                    placeholder="Application ID from Discord Developer Portal"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-guild-id" className="text-slate-700 dark:text-slate-300 font-medium">
                    Discord Server ID
                  </Label>
                  <Input
                    id="discord-guild-id"
                    value={settings.DISCORD_GUILD_ID}
                    onChange={(e) => handleInputChange('DISCORD_GUILD_ID', e.target.value)}
                    placeholder="Your Discord server ID"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord-channel-id" className="text-slate-700 dark:text-slate-300 font-medium">
                    Discord Channel ID
                  </Label>
                  <Input
                    id="discord-channel-id"
                    value={settings.DISCORD_CHANNEL_ID}
                    onChange={(e) => handleInputChange('DISCORD_CHANNEL_ID', e.target.value)}
                    placeholder="Channel ID for notifications"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Configure SMTP settings for email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-host" className="text-slate-700 dark:text-slate-300 font-medium">
                    SMTP Host
                  </Label>
                  <Input
                    id="email-host"
                    value={settings.EMAIL_SERVER_HOST}
                    onChange={(e) => handleInputChange('EMAIL_SERVER_HOST', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-port" className="text-slate-700 dark:text-slate-300 font-medium">
                    SMTP Port
                  </Label>
                  <Input
                    id="email-port"
                    value={settings.EMAIL_SERVER_PORT}
                    onChange={(e) => handleInputChange('EMAIL_SERVER_PORT', e.target.value)}
                    placeholder="587"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-user" className="text-slate-700 dark:text-slate-300 font-medium">
                    SMTP Username
                  </Label>
                  <Input
                    id="email-user"
                    value={settings.EMAIL_SERVER_USER}
                    onChange={(e) => handleInputChange('EMAIL_SERVER_USER', e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-password" className="text-slate-700 dark:text-slate-300 font-medium">
                    SMTP Password
                  </Label>
                  <Input
                    id="email-password"
                    type="password"
                    value={settings.EMAIL_SERVER_PASSWORD}
                    onChange={(e) => handleInputChange('EMAIL_SERVER_PASSWORD', e.target.value)}
                    placeholder="App password or SMTP password"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email-from" className="text-slate-700 dark:text-slate-300 font-medium">
                    From Email Address
                  </Label>
                  <Input
                    id="email-from"
                    value={settings.EMAIL_FROM}
                    onChange={(e) => handleInputChange('EMAIL_FROM', e.target.value)}
                    placeholder="noreply@yourdomain.com"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Settings */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="h-5 w-5" />
                Monitoring Configuration
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Configure how often TestFlight URLs are checked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="check-interval" className="text-slate-700 dark:text-slate-300 font-medium">
                  Check Interval (milliseconds)
                </Label>
                <Input
                  id="check-interval"
                  value={settings.TESTFLIGHT_CHECK_INTERVAL}
                  onChange={(e) => handleInputChange('TESTFLIGHT_CHECK_INTERVAL', e.target.value)}
                  placeholder="300000 (5 minutes)"
                  className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Default: 300000 (5 minutes). Lower values check more frequently but use more resources.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
