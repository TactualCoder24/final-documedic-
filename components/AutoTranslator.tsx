import { useEffect } from 'react';
import translationEN from '../locales/en/translation.json';
import translationHI from '../locales/hi/translation.json';
import translationPA from '../locales/pa/translation.json';

const flattenJSON = (obj: any, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenJSON(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};

const enFlat = flattenJSON(translationEN);
const hiFlat = flattenJSON(translationHI);
const paFlat = flattenJSON(translationPA);

const staticDicts: Record<string, Record<string, string>> = {
    'Hindi': Object.keys(enFlat).reduce((acc: Record<string, string>, key) => {
        if (hiFlat[key]) acc[enFlat[key].trim()] = hiFlat[key];
        return acc;
    }, {}),
    'Punjabi': Object.keys(enFlat).reduce((acc: Record<string, string>, key) => {
        if (paFlat[key]) acc[enFlat[key].trim()] = paFlat[key];
        return acc;
    }, {})
};

export const SUPPORTED_LANGUAGES = [
    'English', 'Hindi', 'Punjabi', 'Bengali', 'Marathi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam'
];

let currentLang = localStorage.getItem('app_lang') || 'English';
let translationCache: Record<string, string> = JSON.parse(localStorage.getItem(`lang_cache_${currentLang}`) || '{}');

export const setAppLanguage = (lang: string) => {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    translationCache = JSON.parse(localStorage.getItem(`lang_cache_${lang}`) || '{}');
    window.location.reload();
};

export const getAppLanguage = () => currentLang;

export const AutoTranslator = () => {
    useEffect(() => {
        if (currentLang === 'English') return;

        let queue: Set<Text> = new Set();
        let timeout: any = null;
        let isTranslating = false;

        const processQueue = async () => {
            if (queue.size === 0 || isTranslating) return;
            isTranslating = true;

            const nodesToTranslate = Array.from(queue);
            queue.clear();

            const textsToFetch = new Map<string, Text[]>();

            nodesToTranslate.forEach(node => {
                const text = node.nodeValue?.trim();
                // Skip if disconnected or symbolic
                if (!node.isConnected || !text || text.length < 2 || !/[a-zA-Z]/.test(text)) return;

                if (translationCache[text]) {
                    node.nodeValue = node.nodeValue!.replace(text, translationCache[text]);
                } else {
                    if (!textsToFetch.has(text)) textsToFetch.set(text, []);
                    textsToFetch.get(text)!.push(node);
                }
            });

            const uniqueTexts = Array.from(textsToFetch.keys());

            if (uniqueTexts.length > 0) {
                const dict = staticDicts[currentLang] || {};

                uniqueTexts.forEach((originalText) => {
                    const transText = dict[originalText.trim()];
                    if (transText && transText !== originalText) {
                        translationCache[originalText] = transText;
                        textsToFetch.get(originalText)?.forEach(n => {
                            if (n.isConnected && n.nodeValue) {
                                n.nodeValue = n.nodeValue.replace(originalText, transText);
                            }
                        });
                    }
                });
                localStorage.setItem(`lang_cache_${currentLang}`, JSON.stringify(translationCache));
            }

            isTranslating = false;
            if (queue.size > 0) {
                setTimeout(processQueue, 500);
            }
        };

        const observer = new MutationObserver((mutations) => {
            let changes = false;
            mutations.forEach(mutation => {
                const checkNode = (node: Node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.nodeValue?.trim();
                        // Also skip text nodes containing JSON or urls
                        if (text && text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('{"') && !text.startsWith('http')) {
                            if (translationCache[text]) {
                                node.nodeValue = node.nodeValue!.replace(text, translationCache[text]);
                            } else {
                                queue.add(node as Text);
                                changes = true;
                            }
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT' || el.hasAttribute('data-notranslate')) return;
                        node.childNodes.forEach(checkNode);
                    }
                };

                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(checkNode);
                } else if (mutation.type === 'characterData') {
                    checkNode(mutation.target);
                }
            });

            if (changes) {
                clearTimeout(timeout);
                timeout = setTimeout(processQueue, 1000);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        // Initial pass
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let node;
        let changes = false;
        while ((node = walk.nextNode())) {
            const parent = node.parentNode as Element;
            if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.hasAttribute('data-notranslate'))) continue;

            const text = node.nodeValue?.trim();
            if (text && text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('{"') && !text.startsWith('http')) {
                if (translationCache[text]) {
                    node.nodeValue = node.nodeValue!.replace(text, translationCache[text]);
                } else {
                    queue.add(node as Text);
                    changes = true;
                }
            }
        }

        if (changes) {
            clearTimeout(timeout);
            timeout = setTimeout(processQueue, 500);
        }

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, []);

    return null;
};
