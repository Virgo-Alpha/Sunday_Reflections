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
import { format, addDays } from 'date-fns';
import { ArrowLeft, Save, CheckCircle, Lock, PartyPopper, MoreVertical, Download, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export const ReflectionForm: React.FC = () => {
  const { user } = useAuth();
  const { passphrase } = usePassphrase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<Date>(getCurrentWeekStart());
  const [isLocked, setIsLocked] = useState(false);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [reflectionId, setReflectionId] = useState<string | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const loadReflection = async () => {
      if (!user || !passphrase) return;

      try {
        // Get user timezone
        const profile = await getProfile(user.id);
        const timezone = profile?.timezone || 'UTC';
        setUserTimezone(timezone);

        // Determine which week to load
        const weekParam = searchParams.get('week');
        const targetWeekStart = weekParam 
          ? new Date(weekParam) 
          : getCurrentWeekStart(timezone);
        
        setWeekStartDate(targetWeekStart);
        setIsLocked(isReflectionLocked(targetWeekStart, timezone));

        // Try to load existing reflection
        const existingReflection = await getReflection(user.id, targetWeekStart, passphrase);
        if (existingReflection) {
          setAnswers(existingReflection.answers);
          setReflectionId(existingReflection.reflection.id);
          setIsCompleted(existingReflection.reflection.is_completed);
          // If reflection is completed, start in read-only mode
          setIsEditMode(!existingReflection.reflection.is_completed);
        } else {
          // New reflection, start in edit mode
          setIsEditMode(true);
        }
      } catch (error: any) {
        console.error('Error loading reflection:', error);
        if (error.message.includes('passphrase')) {
          toast({
            title: 'Invalid passphrase',
            description: 'Please refresh and enter the correct passphrase.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadReflection();
  }, [user, passphrase, searchParams, toast]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSave = async (markCompleted: boolean = false) => {
    if (!user || !passphrase) {
      toast({
        title: 'Error',
        description: 'User or passphrase not available.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedReflection = await saveReflection(user.id, weekStartDate, answers, passphrase, markCompleted, reflectionId);
      
      // Update the reflection ID if this was a new reflection
      if (!reflectionId && savedReflection?.id) {
        setReflectionId(savedReflection.id);
      }
      
      if (markCompleted) {
        setIsCompleted(true);
        setIsEditMode(false);
        setShowCompletionMessage(true);
        toast({
          title: 'Reflection completed! 🎉',
          description: 'Your weekly reflection has been completed and saved.',
        });
        // Redirect to dashboard after showing completion message
        setTimeout(() => {
          router.push('/dashboard');
        }, 7000);
      } else {
        toast({
          title: 'Draft saved',
          description: 'Your reflection has been saved. You can continue later.',
        });
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
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
      toast({
        title: 'Reflection deleted',
        description: 'Your reflection has been successfully deleted.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'An error occurred while deleting the reflection.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = (exportFormat: 'pdf' | 'word' | 'json') => {
    const filename = `reflection-${format(weekStartDate, 'yyyy-MM-dd')}`;
    
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

    toast({
      title: 'Export successful',
      description: `Your reflection has been exported as ${exportFormat.toUpperCase()}.`,
    });
  };

  const handleEnableEdit = () => {
    setIsEditMode(true);
    toast({
      title: 'Edit mode enabled',
      description: 'You can now update your completed reflection.',
    });
  };

  const getProgress = () => {
    const answeredQuestions = Object.values(answers).filter(answer => answer.trim().length > 0).length;
    return (answeredQuestions / REFLECTION_QUESTIONS.length) * 100;
  };

  const isCurrentWeek = format(weekStartDate, 'yyyy-MM-dd') === format(getCurrentWeekStart(userTimezone), 'yyyy-MM-dd');
  const weekEndDate = addDays(weekStartDate, 6);
  const isReadOnly = isLocked || (isCompleted && !isEditMode);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showCompletionMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <PartyPopper className="h-16 w-16 mx-auto text-green-600 dark:text-green-400 mb-4" />
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              {isLocked && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Read Only</span>
                </div>
              )}
              
              {isCompleted && !isEditMode && !isLocked && (
                <Button variant="outline" size="sm" onClick={handleEnableEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Reflection
                </Button>
              )}
              
              {reflectionId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('word')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export as Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')}>
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
                Week of {format(weekStartDate, 'MMMM d')} - {format(weekEndDate, 'MMMM d, yyyy')}
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
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
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
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Reflection
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