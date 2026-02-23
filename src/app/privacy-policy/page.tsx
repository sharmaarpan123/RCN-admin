"use client";

import { getCmsBySlugApi } from "@/apis/ApiCalls";
import Footer from "@/components/LandingPage/Footer";
import { checkResponse } from "@/utils/commonFunc";
import { useQuery } from "@tanstack/react-query";

const CMS_SLUG = "privacy-policy";

type CmsPageData = {
    _id: string;
    slug: string;
    name: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
};

type CmsApiResponse = {
    success?: boolean;
    message?: string;
    data?: CmsPageData;
    meta?: unknown;
};

const PrivacyPolicyPage = () => {
    const { data: res, isLoading, error } = useQuery({
        queryKey: ["cms", CMS_SLUG],
        queryFn: async () => {
            const res = await getCmsBySlugApi(CMS_SLUG);
            if (!checkResponse({ res })) return null;
            return res.data as CmsApiResponse;
        },
    });

    const page = res?.data;

    if (isLoading) {
        return (
            <div className=" w-full text-center mx-auto px-4 py-8">
                <p className="text-rcn-muted">Loading…</p>
            </div>
        );

    }

    if (error || !page) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <p className="text-red-600">Failed to load privacy policy.</p>
            </div>
        );
    }

    return (
        <>
           
            <div className="container min-h-screen mx-auto px-4 py-8">
                <article>
                    <h1 className="text-2xl font-bold mb-6">{page.name}</h1>
                    <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
                    />
                </article>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicyPage;
