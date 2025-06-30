
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Sparkles, Save, Eye } from "lucide-react";
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
};

export const QuizBuilder = () => {
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    tags: [],
    questions: []
  });
  const [newTag, setNewTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !quiz.tags.includes(newTag.trim())) {
      setQuiz(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuiz(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateQuestionsWithAI = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for AI generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI API call - in real app, this would call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedQuestions: Question[] = Array.from({ length: aiQuestionCount }, (_, i) => ({
        id: `ai-${Date.now()}-${i}`,
        question: `What is the most important concept in ${aiTopic}? (Question ${i + 1})`,
        options: [
          `Primary concept of ${aiTopic}`,
          `Secondary aspect of ${aiTopic}`,
          `Advanced technique in ${aiTopic}`,
          `Basic principle of ${aiTopic}`
        ],
        correctAnswer: 0
      }));

      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, ...generatedQuestions],
        title: prev.title || `${aiTopic} Quiz`,
        description: prev.description || `AI-generated quiz about ${aiTopic}`,
        tags: prev.tags.includes(aiTopic.toLowerCase()) ? prev.tags : [...prev.tags, aiTopic.toLowerCase()]
      }));

      toast({
        title: "Success!",
        description: `Generated ${aiQuestionCount} questions about ${aiTopic}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveQuiz = () => {
    if (!quiz.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title",
        variant: "destructive"
      });
      return;
    }

    if (quiz.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage for demo purposes
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const quizToSave = { ...quiz, id: quiz.id || Date.now().toString() };
    const updatedQuizzes = quiz.id 
      ? savedQuizzes.map((q: Quiz) => q.id === quiz.id ? quizToSave : q)
      : [...savedQuizzes, quizToSave];
    
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    
    setQuiz(quizToSave);
    toast({
      title: "Quiz Saved!",
      description: "Your quiz has been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Quiz
          </CardTitle>
          <CardDescription>
            Build engaging quizzes manually or use AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Creation</TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Assist
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="space-y-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Quiz Generator
                  </CardTitle>
                  <CardDescription>
                    Let AI create quiz questions for you based on any topic
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ai-topic">Topic</Label>
                      <Input
                        id="ai-topic"
                        placeholder="e.g., JavaScript, History, Biology"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ai-count">Number of Questions</Label>
                      <Input
                        id="ai-count"
                        type="number"
                        min="1"
                        max="20"
                        value={aiQuestionCount}
                        onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 5)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={generateQuestionsWithAI} 
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title"
                    value={quiz.title}
                    onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the quiz"
                    value={quiz.description}
                    onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quiz.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Questions ({quiz.questions.length})</h3>
          <Button onClick={addQuestion} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {quiz.questions.map((question, questionIndex) => (
          <Card key={question.id} className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                />
              </div>

              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                        className="text-green-600"
                      />
                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        className={question.correctAnswer === optionIndex ? 'border-green-500' : ''}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select the radio button next to the correct answer
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save/Preview Actions */}
      <div className="flex gap-4 pt-6">
        <Button onClick={saveQuiz} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Quiz
        </Button>
        <Button variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Preview Quiz
        </Button>
      </div>
    </div>
  );
};
