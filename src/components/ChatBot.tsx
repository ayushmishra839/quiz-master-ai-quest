
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, User, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type QuizResult = {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[];
};

type Quiz = {
  id: string;
  title: string;
  questions: any[];
};

type Message = {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
};

interface ChatBotProps {
  quizResult: QuizResult;
  quiz: Quiz;
  onClose: () => void;
}

export const ChatBot = ({ quizResult, quiz, onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Great job on completing "${quiz.title}"! You scored ${quizResult.score}/${quizResult.totalQuestions} (${Math.round((quizResult.score/quizResult.totalQuestions)*100)}%). I'm here to help explain any questions you got wrong or provide additional insights. What would you like to know?`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Analyze the quiz result to provide context
    const wrongAnswers = quizResult.answers.filter(a => !a.correct);
    const correctAnswers = quizResult.answers.filter(a => a.correct);
    
    if (input.includes('wrong') || input.includes('incorrect')) {
      if (wrongAnswers.length === 0) {
        return "Actually, you got all questions correct! Perfect score! 🎉 Is there any specific concept you'd like me to explain further?";
      }
      return `You got ${wrongAnswers.length} question(s) wrong. Let me help explain them. The key concepts you might want to review are related to the fundamentals covered in this quiz. Would you like me to explain a specific question number?`;
    }
    
    if (input.includes('question') && /\d+/.test(input)) {
      const questionNum = parseInt(input.match(/\d+/)?.[0] || '1');
      if (questionNum <= quiz.questions.length) {
        const question = quiz.questions[questionNum - 1];
        const userAnswer = quizResult.answers.find(a => a.questionId === question.id);
        const isCorrect = userAnswer?.correct;
        
        return `Question ${questionNum}: "${question.question}"\n\nThe correct answer is: ${question.options[question.correctAnswer]}\n\n${
          isCorrect 
            ? "You got this one right! Great job understanding this concept." 
            : `You selected: ${question.options[userAnswer?.selectedAnswer || 0]}. The key thing to remember is that ${question.options[question.correctAnswer]} is correct because it represents the fundamental principle being tested.`
        }\n\nWould you like me to explain the reasoning behind this answer?`;
      }
    }
    
    if (input.includes('explain') || input.includes('why')) {
      return "I'd be happy to explain! The concepts in this quiz are designed to test your understanding of the fundamentals. Each incorrect answer is a learning opportunity. The correct answers follow logical principles that, once understood, make similar questions much easier. What specific part would you like me to break down?";
    }
    
    if (input.includes('improve') || input.includes('better')) {
      return `Based on your performance (${Math.round((quizResult.score/quizResult.totalQuestions)*100)}%), here are some suggestions:\n\n• Review the concepts behind the questions you missed\n• Practice similar problems to reinforce understanding\n• Focus on the fundamental principles rather than memorizing answers\n• Take your time to read each question carefully\n\nYour current score shows ${quizResult.score >= quizResult.totalQuestions * 0.8 ? 'excellent' : quizResult.score >= quizResult.totalQuestions * 0.6 ? 'good' : 'developing'} understanding. Keep practicing!`;
    }
    
    if (input.includes('study') || input.includes('resources')) {
      return "Here are some study recommendations:\n\n• Review the core concepts covered in this quiz\n• Practice with similar questions\n• Focus on understanding the 'why' behind correct answers\n• Create notes summarizing key concepts\n• Take quizzes regularly to reinforce learning\n\nConsistent practice is key to improvement!";
    }
    
    // Default response
    return "I'm here to help you understand the quiz better! You can ask me things like:\n\n• 'Why was question 3 wrong?'\n• 'Explain the correct answer for question 1'\n• 'How can I improve my score?'\n• 'What should I study next?'\n\nWhat would you like to know?";
  };

  const quickQuestions = [
    "Why was this question wrong?",
    "Explain question 1",
    "How can I improve?",
    "What should I study next?"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" />
              Quiz Assistant
            </CardTitle>
            <CardDescription>
              Ask me about your quiz results and get explanations
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.isBot && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                      {!message.isBot && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-indigo-100 text-indigo-900 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Quick Questions */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Quick questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Ask me about your quiz results..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
