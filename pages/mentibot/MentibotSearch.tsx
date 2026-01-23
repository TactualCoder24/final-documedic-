
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search as SearchIcon,
    MapPin,
    Star,
    ArrowLeft,
    Filter,
    X
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { sampleAccommodations } from '../../src/mockData';

const MentibotSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');

    const filteredResults = useMemo(() => {
        return sampleAccommodations.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
            const matchesType = selectedType === 'all' || item.property_type.toLowerCase() === selectedType.toLowerCase();

            return matchesQuery && matchesPrice && matchesType;
        });
    }, [searchQuery, priceRange, selectedType]);

    const propertyTypes = ['all', ...Array.from(new Set(sampleAccommodations.map(a => a.property_type.toLowerCase())))];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-heading">Find a Retreat</h1>
                        <p className="text-muted-foreground">Discover peaceful stays near Santa Marta's healing nature.</p>
                    </div>
                </div>

                <div className="relative group max-w-md w-full">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        className="pl-10 h-11 rounded-xl"
                        placeholder="Search by location, feature, or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant={showFilters ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="rounded-full gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>

                {propertyTypes.map(type => (
                    <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className="rounded-full capitalize"
                    >
                        {type}
                    </Button>
                ))}

                {(searchQuery || selectedType !== 'all') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedType('all');
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/5"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="bg-muted/30 border-border/50 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Price Range (Up to ${priceRange[1]})</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-xs font-mono">
                                        <span>$0</span>
                                        <span>$500+</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.length > 0 ? (
                    filteredResults.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="h-full border-border/50 hover:border-primary/50 transition-colors group">
                                <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                                    <img
                                        src={`https://images.unsplash.com/photo-${1500000000000 + idx}?auto=format&fit=crop&q=80&w=800`}
                                        alt={item.name}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                                        <span className="text-xs font-bold">{item.review_scores_rating / 20}</span>
                                    </div>
                                </div>
                                <CardHeader className="p-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <MapPin className="h-3 w-3" />
                                        {item.host_location}
                                    </div>
                                    <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            <span className="text-xl font-bold text-primary">${item.price}</span>
                                            <span className="text-xs text-muted-foreground ml-1">/ night</span>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-full">Details</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="inline-flex p-6 rounded-full bg-muted">
                            <X className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No Stays Found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters to find more results.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentibotSearch;
