'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { usePassphrase } from '@/contexts/PassphraseContext';
import { getCurrentWeekStart, getUserReflections, isReflectionLocked, getReflection, deleteReflection } from '@/lib/reflections';
import { getProfile } from '@/lib/profile';
import { exportToPDF, exportToWord, exportToJSON } from '@/lib/export';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Settings, Plus, BookOpen, Lock, LogOut, MoreVertical, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { passphrase } = usePassphrase();
  const { toast } = useToast();
  const router = useRouter();
  const [reflections, setReflections] = useState<any[]>([]);
  const [currentWeekReflection, setCurrentWeekReflection] = useState<any>(null);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      if (!user || !passphrase) {
        setLoading(false);
        return;
      }

      try {
        // Load user profile first to get timezone
        let timezone = 'UTC';
        try {
          const profile = await getProfile(user.id);
          if (profile?.timezone) {
            timezone = profile.timezone;
            setUserTimezone(timezone);
          }
        } catch (profileError) {
          console.warn('Could not load user profile, using UTC timezone:', profileError);
          // Continue with UTC timezone
        }

        // Calculate current week start with the correct timezone
        const weekStart = getCurrentWeekStart(timezone);
        setCurrentWeekStart(weekStart);

        // Load reflections
        try {
          const userReflections = await getUserReflections(user.id);
          setReflections(userReflections);

          // Find current week reflection
          const currentWeekString = format(weekStart, 'yyyy-MM-dd');
          const currentReflection = userReflections.find(
            r => r.week_start_date === currentWeekString
          );
          setCurrentWeekReflection(currentReflection);
        } catch (reflectionsError) {
          console.error('Error loading reflections:', reflectionsError);
          toast({
            title: 'Error loading reflections',
            description: 'Could not load your past reflections. Please try refreshing the page.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error loading data',
          description: 'Some data may not be available. Please check your connection and try refreshing.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, passphrase, toast]);

  const currentWeekEnd = addDays(currentWeekStart, 6);
  const isCurrentWeekLocked = isReflectionLocked(currentWeekStart, userTimezone);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: error.message || 'An error occurred while signing out.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReflection = async (reflectionId: string, weekStartDate: string) => {
    try {
      await deleteReflection(reflectionId);
      
      // Remove from local state
      setReflections(prev => prev.filter(r => r.id !== reflectionId));
      
      // If it was the current week reflection, clear it
      if (currentWeekReflection?.id === reflectionId) {
        setCurrentWeekReflection(null);
      }

      toast({
        title: 'Reflection deleted',
        description: 'Your reflection has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'An error occurred while deleting the reflection.',
        variant: 'destructive',
      });
    }
  };

  const handleExportReflection = async (reflection: any, format: 'pdf' | 'word' | 'json') => {
    if (!passphrase) {
      toast({
        title: 'Error',
        description: 'Passphrase not available for decryption.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const weekStartDate = new Date(reflection.week_start_date);
      const reflectionData = await getReflection(user!.id, weekStartDate, passphrase);
      
      if (!reflectionData) {
        toast({
          title: 'Error',
          description: 'Could not load reflection data.',
          variant: 'destructive',
        });
        return;
      }

      const filename = `reflection-${reflection.week_start_date}`;
      
      switch (format) {
        case 'pdf':
          exportToPDF(reflectionData.answers, weekStartDate, `${filename}.pdf`);
          break;
        case 'word':
          exportToWord(reflectionData.answers, weekStartDate, `${filename}.txt`);
          break;
        case 'json':
          exportToJSON(reflectionData.answers, weekStartDate, `${filename}.json`);
          break;
      }

      toast({
        title: 'Export successful',
        description: `Your reflection has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error.message || 'An error occurred while exporting the reflection.',
        variant: 'destructive',
      });
    }
  };

  const getReflectionStatus = () => {
    if (isCurrentWeekLocked) return 'locked';
    if (!currentWeekReflection) return 'not-started';
    if (currentWeekReflection.is_completed) return 'completed';
    return 'in-progress';
  };

  const getStatusBadge = () => {
    const status = getReflectionStatus();
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft Saved</Badge>;
      case 'locked':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Locked</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Not Started</Badge>;
    }
  };

  const getActionButton = () => {
    const status = getReflectionStatus();
    
    if (status === 'locked') {
      return (
        <Button disabled className="w-full">
          <Lock className="mr-2 h-4 w-4" />
          Week Locked
        </Button>
      );
    }

    const buttonText = status === 'not-started' ? 'Start Reflection' : 
                      status === 'completed' ? 'View Reflection' : 'Continue Draft';
    const icon = status === 'not-started' ? <Plus className="mr-2 h-4 w-4" /> : <BookOpen className="mr-2 h-4 w-4" />;

    return (
      <Link href="/reflect" className="w-full">
        <Button className="w-full">
          {icon}
          {buttonText}
        </Button>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Sunday Reflections
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                Your weekly journey of self-discovery and growth
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Current Week Card */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Current Week
                  </CardTitle>
                  <CardDescription>
                    {format(currentWeekStart, 'MMMM d')} - {format(currentWeekEnd, 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                {isCurrentWeekLocked 
                  ? 'This week is locked for editing'
                  : 'Available for reflection until Monday midnight'
                }
              </div>
              {getActionButton()}
            </CardContent>
          </Card>

          {/* Past Reflections */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Past Reflections
            </h2>

            {reflections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No reflections yet. Start your first weekly reflection above!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reflections.map((reflection) => {
                  const isCurrentWeekReflection = reflection.week_start_date === format(currentWeekStart, 'yyyy-MM-dd');
                  
                  return (
                    <Card key={reflection.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              Week of {format(new Date(reflection.week_start_date), 'MMMM d, yyyy')}
                              {isCurrentWeekReflection && (
                                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(Current Week)</span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {reflection.is_completed ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Draft
                                </Badge>
                              )}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Created {format(new Date(reflection.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/reflect?week=${reflection.week_start_date}`}>
                              <Button variant="outline" size="sm">
                                {reflection.is_completed ? 'View' : 'Continue'}
                              </Button>
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExportReflection(reflection, 'pdf')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export as PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportReflection(reflection, 'word')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export as Text
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportReflection(reflection, 'json')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export as JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <div className="flex items-center w-full cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Reflection
                                      </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Reflection</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this reflection from {format(new Date(reflection.week_start_date), 'MMMM d, yyyy')}? 
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteReflection(reflection.id, reflection.week_start_date)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};