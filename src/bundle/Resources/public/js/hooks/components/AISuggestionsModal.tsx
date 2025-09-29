import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sparkles,
    Brain,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    RefreshCw,
    X,
    AlertTriangle
} from "lucide-react";

interface AISuggestionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    englishContent: any;
    frenchContent: any;
}

interface Suggestion {
    id: string;
    type: 'improvement' | 'inconsistency' | 'optimization';
    field: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    suggestion: string;
    impact: string;
}

interface ApiResponse {
    diff: {
        choices: Array<{
            message: {
                content: string;
            };
        }>;
    };
    content_id: number;
    version_a: {
        number: number;
        language: string;
    };
    version_b: {
        number: number;
        language: string;
    };
}

interface FieldAnalysis {
    translationRating: number;
    translationError: string;
    errorSeverity: 'critical' | 'high' | 'medium' | 'low';
    suggestedTranslation: any;
    changesExplanation: string;
}

export const AISuggestionsModal = ({
                                       open,
                                       onOpenChange,
                                       englishContent,
                                       frenchContent
                                   }: AISuggestionsModalProps) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisStep, setAnalysisStep] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const analysisSteps = [
        "Initializing AI translation analyzer...",
        "Scanning content structure and semantics...",
        "Comparing linguistic patterns...",
        "Analyzing cultural context and tone...",
        "Identifying translation inconsistencies...",
        "Evaluating content quality metrics...",
        "Generating optimization suggestions...",
        "Finalizing recommendations..."
    ];

    // Build API endpoint from current URL
    const buildApiEndpoint = (): string => {
        const currentPath = window.location.pathname;
        const compareSplitIndex = currentPath.indexOf('/compare-split/');

        if (compareSplitIndex === -1) {
            // Fallback if we can't find the pattern
            return '/api/translations/diff';
        }

        const urlSegments = currentPath.substring(compareSplitIndex + '/compare-split/'.length);
        return `/api/translations/diff/${urlSegments}`;
    };

    useEffect(() => {
        if (open && !showResults) {
            startAnalysis();
        }
    }, [open]);

    const parseSuggestions = (apiResponse: ApiResponse): Suggestion[] => {
        try {
            // Validate response structure
            if (!apiResponse?.diff?.choices?.[0]?.message?.content) {
                throw new Error('Invalid API response structure');
            }

            // Parse the JSON content from the OpenAI response
            const content = apiResponse.diff.choices[0].message.content;
            const fieldAnalyses: Record<string, FieldAnalysis> = JSON.parse(content);

            // Convert field analyses to suggestions
            const suggestions: Suggestion[] = [];

            Object.entries(fieldAnalyses).forEach(([fieldName, analysis]) => {
                // Validate field analysis structure
                if (!analysis || typeof analysis !== 'object') {
                    console.warn(`Skipping invalid field analysis for ${fieldName}`);
                    return;
                }

                const suggestion: Suggestion = {
                    id: `${fieldName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: (analysis.translationRating || 10) <= 3 ? 'inconsistency' : 'improvement',
                    field: fieldName,
                    severity: mapSeverity(analysis.errorSeverity || 'low', analysis.translationRating || 10),
                    title: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Translation Issue`,
                    description: analysis.translationError || 'Translation issue detected',
                    suggestion: analysis.suggestedTranslation || 'Review and improve translation',
                    impact: `Translation rating: ${analysis.translationRating || 'N/A'}/10. ${analysis.changesExplanation || 'Review recommended'}`
                };

                suggestions.push(suggestion);
            });

            return suggestions;
        } catch (error) {
            console.error('Error parsing suggestions:', error);
            throw new Error(`Failed to parse API response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const mapSeverity = (errorSeverity: string, translationRating: number): 'high' | 'medium' | 'low' => {
        if (errorSeverity === 'critical' || translationRating <= 2) {
            return 'high';
        } else if (errorSeverity === 'high' || translationRating <= 5) {
            return 'medium';
        } else {
            return 'low';
        }
    };

    const fetchSuggestions = async (): Promise<Suggestion[]> => {
        const apiEndpoint = buildApiEndpoint();

        const requestPayload = {
            englishContent,
            frenchContent,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers like authorization if needed
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResponse: ApiResponse = await response.json();
            return parseSuggestions(apiResponse);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            throw error;
        }
    };

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        setProgress(0);
        setShowResults(false);
        setSuggestions([]);
        setSelectedSuggestions([]);
        setError(null);

        try {
            // Simulate progress through analysis steps
            for (let i = 0; i < analysisSteps.length; i++) {
                setAnalysisStep(analysisSteps[i]);
                setProgress((i + 1) * (85 / analysisSteps.length)); // Leave 15% for API call

                // Shorter delays for better UX
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Make the actual API call
            setAnalysisStep("Fetching AI recommendations...");
            const suggestions = await fetchSuggestions();

            setProgress(100);
            setSuggestions(suggestions);
            setShowResults(true);

        } catch (error) {
            console.error('Analysis failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to analyze translations';
            setError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleSuggestionSelection = (suggestionId: string) => {
        setSelectedSuggestions(prev =>
            prev.includes(suggestionId)
                ? prev.filter(id => id !== suggestionId)
                : [...prev, suggestionId]
        );
    };

    const selectAllSuggestions = () => {
        setSelectedSuggestions(suggestions.map(s => s.id));
    };

    const deselectAllSuggestions = () => {
        setSelectedSuggestions([]);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-destructive';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-blue-600';
            default: return 'text-muted-foreground';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return <AlertCircle className="w-4 h-4" />;
            case 'medium': return <TrendingUp className="w-4 h-4" />;
            case 'low': return <Lightbulb className="w-4 h-4" />;
            default: return <CheckCircle className="w-4 h-4" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'inconsistency': return <AlertCircle className="w-4 h-4" />;
            case 'improvement': return <TrendingUp className="w-4 h-4" />;
            case 'optimization': return <Lightbulb className="w-4 h-4" />;
            default: return <CheckCircle className="w-4 h-4" />;
        }
    };

    const retryAnalysis = () => {
        setError(null);
        startAnalysis();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary text-white">
                            <Brain className="w-5 h-5" />
                        </div>
                        AI Translation Analysis & Suggestions
                    </DialogTitle>
                </DialogHeader>

                {isAnalyzing && (
                    <div className="space-y-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="relative w-16 h-16 mx-auto">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary animate-ai-pulse"></div>
                                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-ai-primary animate-ai-shimmer" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Analyzing Content Translations</h3>
                                <p className="text-sm text-muted-foreground animate-ai-pulse">
                                    {analysisStep}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Analysis Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-primary">2</div>
                                <div className="text-sm text-muted-foreground">Languages</div>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-primary">
                                    {Object.keys(englishContent || {}).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Content Fields</div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="space-y-4 py-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-destructive">Translation Analysis Failed</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    {error}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Please check your connection and try again, or contact support if the issue persists.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                            <Button onClick={retryAnalysis} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Retry Analysis
                            </Button>
                        </div>
                    </div>
                )}

                {showResults && suggestions.length === 0 && (
                    <div className="space-y-4 py-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-green-600">Translation Analysis Complete!</h3>
                                <p className="text-sm text-muted-foreground">
                                    All translation fields appear to be accurate and consistent. No improvements needed.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}

                {showResults && suggestions.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Analysis Complete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={selectAllSuggestions}
                                    className="text-xs"
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={deselectAllSuggestions}
                                    className="text-xs"
                                >
                                    Deselect All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={startAnalysis}
                                    className="gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Re-analyze
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Card className="p-4 text-center">
                                <div className="text-2xl font-bold text-destructive">{suggestions.filter(s => s.severity === 'high').length}</div>
                                <div className="text-sm text-muted-foreground">High Priority</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{suggestions.filter(s => s.severity === 'medium').length}</div>
                                <div className="text-sm text-muted-foreground">Medium Priority</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{suggestions.filter(s => s.severity === 'low').length}</div>
                                <div className="text-sm text-muted-foreground">Low Priority</div>
                            </Card>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Recommendations ({suggestions.length})</h3>

                            {suggestions.map((suggestion) => (
                                <Card
                                    key={suggestion.id}
                                    className={`p-4 space-y-3 transition-all duration-200 ${
                                        selectedSuggestions.includes(suggestion.id)
                                            ? 'ring-2 ring-ai-primary bg-ai-accent/5'
                                            : 'hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedSuggestions.includes(suggestion.id)}
                                            onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {getTypeIcon(suggestion.type)}
                                                    <span className="font-medium">{suggestion.title}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getSeverityColor(suggestion.severity)} border-current`}
                                                    >
                                                        {getSeverityIcon(suggestion.severity)}
                                                        <span className="ml-1 capitalize">{suggestion.severity}</span>
                                                    </Badge>
                                                </div>
                                                <Badge variant="secondary" className="shrink-0">{suggestion.field}</Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                {suggestion.description}
                                            </p>

                                            <div className="bg-ai-accent/20 p-3 rounded-lg border border-ai-accent/30">
                                                <div className="text-sm">
                                                    <strong>Recommendation:</strong> {suggestion.suggestion}
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                <strong>Impact:</strong> {suggestion.impact}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                            <Button
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 bg-ai-primary hover:bg-ai-primary/90"
                                disabled={selectedSuggestions.length === 0}
                            >
                                Apply Translation Fixes ({selectedSuggestions.length})
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};