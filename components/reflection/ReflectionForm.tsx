'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { usePassphrase } from '@/contexts/PassphraseContext';
import { 
  REFLECTION_QUESTIONS, 
  ReflectionAnswers, 
  saveReflection, 
  getReflection,
  getCurrentWeekStart,
  isReflectionLocked,
  deleteReflection
} from '@/lib/reflections';
import { getProfile } from '@/lib/profile';
import { exportToPDF, exportToWord, exportToJSON } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { format as formatDate, addDays } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const ReflectionForm: React.FC = () => {
  const { user } = useAuth();
  const { passphrase } = usePassphrase();
  const { toast } = useToast();
  const router = useRouter();
  
  const [answers, setAnswers] = useState<ReflectionAnswers>({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
    question7: '',
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<Date>(getCurrentWeekStart());
  const [isLocked, setIsLocked] = useState(false);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [reflectionId, setReflectionId] = useState<string | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Helper function to safely call toast only in browser environment
  const safeToast = (toastOptions: any) => {
    if (typeof window !== 'undefined') {
      toast(toastOptions);
    }
  };

  // ✅ GRAB A STABLE VALUE FROM THE USER OBJECT
  const userId = user?.id;

  useEffect(() => {
    const loadReflection = async () => {
      // ✅ CHECK AGAINST THE STABLE userId
      if (!userId || !passphrase) {
        console.log('🔍 ReflectionForm: User ID or passphrase not available, skipping load');
        return;
      }

      console.log('🔄 ReflectionForm: Starting to load reflection data');

      try {
        // Get user timezone
        console.log('🌍 Getting user profile for timezone...');
        // ✅ USE THE STABLE userId
        const profile = await getProfile(userId);
        const timezone = profile?.timezone || 'UTC';
        setUserTimezone(timezone);
        console.log('✅ User timezone set to:', timezone);

        // Determine which week to load
        const weekParam = router.query.week as string;
        const targetWeekStart = weekParam 
          ? new Date(weekParam) 
          : getCurrentWeekStart(timezone);
        
        setWeekStartDate(targetWeekStart);
        setIsLocked(isReflectionLocked(targetWeekStart, timezone));
        console.log('📅 Target week start:', targetWeekStart.toISOString());

        // Try to load existing reflection
        console.log('🔍 Attempting to load existing reflection...');
        // ✅ USE THE STABLE userId
        const existingReflection = await getReflection(userId, targetWeekStart, passphrase);
        
        if (existingReflection) {
          console.log('✅ Found existing reflection:', existingReflection.reflection.id);
          setAnswers(existingReflection.answers);
          setReflectionId(existingReflection.reflection.id);
          setIsCompleted(existingReflection.reflection.is_completed);
          // If reflection is completed, start in read-only mode
          setIsEditMode(!existingReflection.reflection.is_completed);
        } else {
          console.log('ℹ️ No existing reflection found, starting fresh');
          // New reflection, start in edit mode
          setIsEditMode(true);
        }
      } catch (error: any) {
        console.error('💥 Error loading reflection:', error);
        if (error.message.includes('passphrase')) {
          safeToast({
            title: 'Invalid passphrase',
            description: 'Please refresh and enter the correct passphrase.',
            variant: 'destructive',
          });
        } else {
          safeToast({
            title: 'Error loading reflection',
            description: 'There was an issue loading your reflection. Please try refreshing the page.',
            variant: 'destructive',
          });
        }
      }
    };

    loadReflection();
  // ✅ USE THE STABLE userId IN THE DEPENDENCY ARRAY
  }, [userId, passphrase, router.query.week]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSave = async (markCompleted: boolean = false) => {
    // ✅ It's good practice to use the stable userId here too
    if (!userId || !passphrase) {
      safeToast({
        title: 'Error',
        description: 'User or passphrase not available.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedReflection = await saveReflection(userId, weekStartDate, answers, passphrase, markCompleted, reflectionId);
      
      // Update the reflection ID if this was a new reflection
      if (!reflectionId && savedReflection?.id) {
        setReflectionId(savedReflection.id);
      }
      
      if (markCompleted) {
        setIsCompleted(true);
        setIsEditMode(false);
        setShowCompletionMessage(true);
        safeToast({
          title: 'Reflection completed! 🎉',
          description: 'Your weekly reflection has been completed and saved.',
        });
        // Redirect to dashboard after showing completion message
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            router.push('/dashboard');
          }
        }, 7000);
      } else {
        safeToast({
          title: 'Draft saved',
          description: 'Your reflection has been saved. You can continue later.',
        });
      }
    } catch (error: any) {
      console.error('Save error:', error);
      safeToast({
        title: 'Save failed',
        description: error.message || 'An error occurred while saving.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!reflectionId) return;

    try {
      await deleteReflection(reflectionId);
      safeToast({
        title: 'Reflection deleted',
        description: 'Your reflection has been successfully deleted.',
      });
      if (typeof window !== 'undefined') {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      safeToast({
        title: 'Delete failed',
        description: error.message || 'An error occurred while deleting the reflection.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = (exportFormat: 'pdf' | 'word' | 'json') => {
    if (typeof window === 'undefined') return;

    const filename = `reflection-${formatDate(weekStartDate, 'yyyy-MM-dd')}`;
    
    try {
      switch (exportFormat) {
        case 'pdf':
          exportToPDF(answers, weekStartDate, `${filename}.pdf`);
          break;
        case 'word':
          exportToWord(answers, weekStartDate, `${filename}.txt`);
          break;
        case 'json':
          exportToJSON(answers, weekStartDate, `${filename}.json`);
          break;
      }

      safeToast({
        title: 'Export successful',
        description: `Your reflection has been exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      safeToast({
        title: 'Export failed',
        description: 'An error occurred while exporting the reflection.',
        variant: 'destructive',
      });
    }
  };

  const handleEnableEdit = () => {
    setIsEditMode(true);
    safeToast({
      title: 'Edit mode enabled',
      description: 'You can now update your completed reflection.',
    });
  };

  const getProgress = () => {
    const answeredQuestions = Object.values(answers).filter(answer => answer.trim().length > 0).length;
    return (answeredQuestions / REFLECTION_QUESTIONS.length) * 100;
  };

  const isCurrentWeek = formatDate(weekStartDate, 'yyyy-MM-dd') === formatDate(getCurrentWeekStart(userTimezone), 'yyyy-MM-dd');
  const weekEndDate = addDays(weekStartDate, 6);
  const isReadOnly = isLocked || (isCompleted && !isEditMode);

  if (showCompletionMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="h-16 w-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <div className="text-green-600 dark:text-green-400 text-2xl">🎉</div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Reflection Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Great job completing your weekly reflection. Your insights have been saved securely.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard" className="block">
                <Button className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting automatically in 7 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              {isLocked && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm font-medium">Read Only</span>
                </div>
              )}
              
              {isCompleted && !isEditMode && !isLocked && (
                <Button variant="outline" size="sm" onClick={handleEnableEdit}>
                  ✏️ Update Reflection
                </Button>
              )}
              
              {reflectionId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      📄 Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('word')}>
                      📝 Export as Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
                      📊 Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400"
                      onClick={(e) => e.preventDefault()}
                    >
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center w-full cursor-pointer">
                            🗑️ Delete Reflection
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Reflection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this reflection? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
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
              )}
            </div>
          </div>

          {/* Week Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isCurrentWeek ? 'This Week\'s Reflection' : 'Weekly Reflection'}
                {isCompleted && (
                  <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                    (Completed)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Week of {formatDate(weekStartDate, 'MMMM d')} - {formatDate(weekEndDate, 'MMMM d, yyyy')}
              </CardDescription>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(getProgress())}% complete</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
              </div>
            </CardHeader>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            {REFLECTION_QUESTIONS.map((question, index) => (
              <Card key={question.id} className={index === currentQuestion ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {index + 1}. {question.text}
                  </CardTitle>
                  <CardDescription>
                    {question.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={answers[question.id as keyof ReflectionAnswers]}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="min-h-[120px] resize-none"
                    disabled={isReadOnly}
                    onFocus={() => setCurrentQuestion(index)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    💾 Save Draft
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving || getProgress() < 100}
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    ✅ Complete Reflection
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};