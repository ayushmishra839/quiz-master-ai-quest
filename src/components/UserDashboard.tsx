
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { QuizTaking } from "@/components/QuizTaking";
import { ChatBot } from "@/components/ChatBot";
import { BookOpen, Search, Trophy, Clock, Brain, LogOut, Star, Target } from "lucide-react";

type User = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  questions: any[];
  attempts?: number;
};

type QuizResult = {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: any[];
};

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

export const UserDashboard = ({ user, onLogout }: UserDashboardProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    loadQuizzes();
    loadQuizResults();
  }, []);

  const loadQuizzes = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    // Add mock data if no quizzes exist
    if (savedQuizzes.length === 0) {
      const mockQuizzes: Quiz[] = [
        {
          id: 'mock-1',
          title: 'JavaScript Fundamentals',
          description: 'Test your knowledge of JavaScript basics',
          tags: ['javascript', 'programming', 'web-development'],
          questions: [
            {
              id: 'q1',
              question: 'What is the correct way to declare a variable in JavaScript?',
              options: ['var myVar = 5;', 'variable myVar = 5;', 'v myVar = 5;', 'declare myVar = 5;'],
              correctAnswer: 0
            },
            {
              id: 'q2',
              question: 'Which method is used to add an element to the end of an array?',
              options: ['push()', 'pop()', 'shift()', 'unshift()'],
              correctAnswer: 0
            }
          ],
          attempts: 24
        },
        {
          id: 'mock-2',
          title: 'React Basics',
          description: 'Understanding React components and hooks',
          tags: ['react', 'javascript', 'frontend'],
          questions: [
            {
              id: 'q3',
              question: 'What is JSX?',
              options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
              correctAnswer: 0
            }
          ],
          attempts: 18
        }
      ];
      setQuizzes(mockQuizzes);
    } else {
      setQuizzes(savedQuizzes);
    }
  };

  const loadQuizResults = () => {
    const results = JSON.parse(localStorage.getItem(`quiz_results_${user.id}`) || '[]');
    setQuizResults(results);
  };

  const handleQuizComplete = (result: QuizResult) => {
    const updatedResults = [...quizResults, result];
    setQuizResults(updatedResults);
    localStorage.setItem(`quiz_results_${user.id}`, JSON.stringify(updatedResults));
    setLastQuizResult(result);
    setCurrentQuiz(null);
    setShowChatBot(true);
  };

  const hasAttempted = (quizId: string) => {
    return quizResults.some(result => result.quizId === quizId);
  };

  const getQuizScore = (quizId: string) => {
    const result = quizResults.find(r => r.quizId === quizId);
    return result ? Math.round((result.score / result.totalQuestions) * 100) : 0;
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || quiz.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(quizzes.flatMap(quiz => quiz.tags)));
  const averageScore = quizResults.length > 0 
    ? Math.round(quizResults.reduce((acc, r) => acc + (r.score / r.totalQuestions * 100), 0) / quizResults.length)
    : 0;

  if (currentQuiz) {
    return (
      <QuizTaking 
        quiz={currentQuiz}
        onComplete={handleQuizComplete}
        onBack={() => setCurrentQuiz(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QuizMaster Pro
              </h1>
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                Student
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
              <BookOpen className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizResults.length}</div>
              <p className="text-xs text-blue-100">Out of {quizzes.length} available</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-green-100">Keep improving!</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Trophy className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizResults.length > 0 
                  ? Math.max(...quizResults.map(r => Math.round((r.score / r.totalQuestions) * 100)))
                  : 0}%
              </div>
              <p className="text-xs text-purple-100">Personal best</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizResults.length * 15}m</div>
              <p className="text-xs text-orange-100">Estimated learning time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
            <CardDescription>
              Challenge yourself with these quizzes (each can only be attempted once)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag('')}
                >
                  All
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => {
            const attempted = hasAttempted(quiz.id);
            const score = getQuizScore(quiz.id);
            
            return (
              <Card key={quiz.id} className={`hover:shadow-lg transition-shadow ${attempted ? 'bg-gray-50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                    {attempted && (
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {score}%
                      </div>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {quiz.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {quiz.questions.length} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~{quiz.questions.length * 2} min
                      </div>
                    </div>

                    {attempted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Score</span>
                          <span className="font-semibold">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      disabled={attempted}
                      onClick={() => setCurrentQuiz(quiz)}
                    >
                      {attempted ? 'Already Completed' : 'Start Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredQuizzes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No quizzes found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedTag 
                  ? "Try adjusting your search criteria" 
                  : "No quizzes are available at the moment"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ChatBot Modal */}
      {showChatBot && lastQuizResult && (
        <ChatBot 
          quizResult={lastQuizResult}
          quiz={quizzes.find(q => q.id === lastQuizResult.quizId)!}
          onClose={() => setShowChatBot(false)}
        />
      )}
    </div>
  );
};
