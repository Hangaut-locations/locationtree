interface IStepFiveProps {
  //   description: string;
  //   setDescription: Dispatch<SetStateAction<string>>;
}

const StepTen: React.FC<IStepFiveProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
        Step 10
      </span>
      <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
        Finish up and publish
      </h1>
      <p className="text-base font-semibold text-muted-foreground leading-relaxed max-w-xl">
        In the final step, you'll select your booking preferences, set your
        prices, and hit "Publish" to send your listing live for guests to see.
      </p>
    </div>
  );
};

export default StepTen;
