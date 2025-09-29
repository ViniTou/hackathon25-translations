import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {ArrowLeft, Sparkles, Eye, GitCompare} from "lucide-react";
import {AISuggestionsModal} from "./AISuggestionsModal";

const VersionComparison = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const englishContent = {
        title: "Innovation",
        shortTitle: "This field is empty",
        author: "Administrator User <admin@link.invalid>",
        intro: "This is how we change the world. This is how we make everyone healthy.",
        body: `Helse's Innovation is dedicated to enhancing human health through innovative projects. We assist local entrepreneurs in developing global healthcare solutions, supporting their journey with a dynamic exchange of ideas and resources to ensure their success.

Ibuprofen 1000 mg

We have had a significant strategy for Research & Development. R&D has always resulted in products that have improved and advanced the knowledge of disease and transformed the practice of medicine. This has always been the aspiration and drive of our company.

Having Diagnostics and Pharmaceuticals in one company is a powerful advantage. Interconnections between the two are central to personalized healthcare strategy. These two divisions share expertise, research facilities, and technologies when working together on projects.`,
        image: {
            src: "/api/placeholder/400/200",
            alt: "Group of people seated at a table during a sunny meeting, writing notes",
            filename: "306b596ae309-leadership.jpg",
            size: "290.7 kB",
            dimensions: "Width: 1920px height: 1062px",
        }
    };

    const frenchContent = {
        title: "Innovation",
        shortTitle: "This field is empty",
        author: "Administrator User <admin@link.invalid>",
        intro: "C'est ainsi que nous changeons le monde. C'est ainsi que nous assurons la santé de tous.",
        body: `Helse's Innovation s'efforce d'améliorer la santé humaine par l'innovation. Pour ce faire, nous aidons les entrepreneurs locaux à concrétiser leurs rêves et aspirations : créer des solutions de soins de santé transformatrices du monde entier. Nous accompagnons ces innovateurs tout au long de leur parcours, en leur offrant un échange dynamique d'idées et de ressources et leur réussite.

Nous avons également une stratégie dédiée à la recherche et au développement. Cette recherche a toujours débouché sur des produits qui ont amélioré et fait progresser les connaissances en matière de maladie et transformé la pratique médicale. Cela a toujours été l'aspiration et le moteur de notre entreprise.

Le regroupement des activités de diagnostic et de produits pharmaceutiques au sein d'une même entreprise constitue un atout majeur. Leur intégration est essentielle à une stratégie de soins de santé personnalisée. Ces deux divisions partagent expertise, installations de recherche et technologies lors de leurs collaborations sur des projets.`,
        image: {
            src: "/api/placeholder/400/200",
            alt: "Innovation 1.jpg",
            filename: "de7a5e021e5e-innovation-1.jpg",
            size: "172.2 kB",
            dimensions: "Width: 1620px height: 1080px",
        }
    };

    return (
        <div>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="ibexa-btn--extra-actions ibexa-btn--create ibexa-btn--primary btn ibexa-btn btn ibexa-btn ibexa-btn--primary bg-ai-primary hover:bg-ai-primary/90 text-white shadow-lg"
                type="button"
            >
                <Sparkles className="w-4 h-4 mr-2"/>
                AI Suggestions
            </Button>
            <AISuggestionsModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                englishContent={englishContent}
                frenchContent={frenchContent}
            />
        </div>
    );
};
const ContentField = ({
                          label,
                          value,
                          isEmpty = false,
                          isLong = false
                      }: {
    label: string;
    value: string;
    isEmpty?: boolean;
    isLong?: boolean;
}) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <div
            className={`text-sm ${isEmpty ? 'italic text-muted-foreground' : ''} ${isLong ? 'leading-relaxed' : ''}`}>
            {isLong ? (
                <div className="space-y-3">
                    {value.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            ) : (
                value
            )}
        </div>
    </div>
);

const ImageField = ({
                        label,
                        image
                    }: {
    label: string;
    image: any;
}) => (
    <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <div className="space-y-3">
            <div className="relative">
                <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full max-w-md h-48 object-cover rounded-md border"
                />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Image file properties:</strong></div>
                <div><strong>File name:</strong> {image.filename}</div>
                <div><strong>Size:</strong> {image.size}</div>
                <div><strong>Alternative text:</strong> {image.alt}</div>
                <div><strong>Master dimensions:</strong> {image.dimensions}</div>
            </div>
        </div>
    </div>
);

export default VersionComparison;