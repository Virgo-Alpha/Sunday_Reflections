'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Shield, Download, Share2, Bell } from 'lucide-react';
import Link from 'next/link';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                Sunday Reflections
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Your weekly journey of self-discovery and growth. Navigate life with intention using the power of reflection.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Philosophy Section */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">The 1 in 60 Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Codie Sanchez has referenced the "1 in 60 rule," a navigation concept from aviation where a 1-degree course deviation results in being 1 mile off target for every 60 miles flown, to emphasize the importance of regular self-reflection to stay on track in life and business.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                She uses this framework in periodic reviews, often conducted on Sundays, to assess progress and make adjustments. Small course corrections made regularly can prevent major deviations from your intended path.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-medium text-center">
                  "The key to staying on course is not perfection, but consistent reflection and adjustment."
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                <CardTitle>Weekly Reflections</CardTitle>
                <CardDescription>
                  Answer 7 thoughtful questions every Sunday to track your growth and insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                <CardTitle>End-to-End Encryption</CardTitle>
                <CardDescription>
                  Your reflections are encrypted with your personal passphrase for complete privacy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Reflections automatically lock after Monday midnight to maintain weekly rhythm
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
                <CardTitle>Gentle Reminders</CardTitle>
                <CardDescription>
                  Optional Saturday prep reminders and Sunday morning reflection prompts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Download className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <CardTitle>Export & Archive</CardTitle>
                <CardDescription>
                  Download your reflections as beautifully formatted PDFs for safekeeping
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Share2 className="h-8 w-8 text-pink-600 dark:text-pink-400 mb-2" />
                <CardTitle>Selective Sharing</CardTitle>
                <CardDescription>
                  Share individual insights or quotes with private links when you choose
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* The 7 Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">The 7 Weekly Questions</CardTitle>
              <CardDescription className="text-center">
                Thoughtfully crafted prompts to guide your reflection journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "What has worked well?",
                  "What didn't work so well?", 
                  "How can I apply what I have learned (actions)?",
                  "Looking back at last week, how much of my day was spent doing things I actively enjoyed?",
                  "How'd that compare to the week before?",
                  "What would you do if you knew you could not fail?",
                  "When are you going to get out of your comfort zone?"
                ].map((question, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 min-w-[2rem] justify-center">
                      {index + 1}
                    </Badge>
                    <p className="text-gray-700 dark:text-gray-300">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands who use Sunday Reflections to stay aligned with their goals and values.
            </p>
            <Link href="/auth">
              <Button size="lg" className="px-12">
                Begin Reflecting Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};