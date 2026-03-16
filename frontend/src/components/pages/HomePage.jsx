import { useState } from "react";
import CreatePost from "../common/CreatePost";
import PostFeed from "../common/PostFeed";

const tabs = [
  { id: "all", label: "For you" },
  { id: "following", label: "Following" },
];

const HomePage = ({ authUser }) => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-surface-3">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 font-semibold text-sm transition-colors relative hover:bg-surface-1 ${
                activeTab === tab.id
                  ? "text-ink-primary"
                  : "text-ink-secondary"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-brand rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Create post */}
      <CreatePost authUser={authUser} />

      {/* Feed */}
      <PostFeed feedType={activeTab} authUser={authUser} />
    </div>
  );
};

export default HomePage;