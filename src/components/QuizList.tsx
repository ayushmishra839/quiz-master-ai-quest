
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Edit3, Trash2, Search, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  questions: Question[];
  createdAt?: string;
  attempts?: number;
};

export const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
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
            }
          ],
          createdAt: '2024-01-15',
          attempts: 24
        },
        {
          id: 'mock-2',
          title: 'React Basics',
          description: 'Understanding React components and hooks',
          tags: ['react', 'javascript', 'frontend'],
          questions: [
            {
              id: 'q2',
              question: 'What is JSX?',
              options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
              correctAnswer: 0
            }
          ],
          createdAt: '2024-01-20',
          attempts: 18
        }
      ];
      localStorage.setItem('quizzes', JSON.stringify(mockQuizzes));
      setQuizzes(mockQuizzes);
    } else {
      setQuizzes(savedQuizzes);
    }
  };

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
    setQuizzes(updatedQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    toast({
      title: "Quiz Deleted",
      description: "The quiz has been permanently removed.",
    });
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || quiz.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(quizzes.flatMap(quiz => quiz.tags)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Manage Quizzes
          </CardTitle>
          <CardDescription>
            View, edit, and manage all your created quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map(quiz => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteQuiz(quiz.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
                    <Users className="h-4 w-4" />
                    {quiz.attempts || 0} attempts
                  </div>
                </div>

                {quiz.createdAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    Created {quiz.createdAt}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1">
                    View Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No quizzes found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedTag 
                ? "Try adjusting your search criteria" 
                : "Create your first quiz to get started"
              }
            </p>
            {!searchTerm && !selectedTag && (
              <Button>Create New Quiz</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
