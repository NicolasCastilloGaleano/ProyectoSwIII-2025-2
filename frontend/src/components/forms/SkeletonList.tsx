import { Skeleton, type SkeletonProps } from "@mui/material";

interface SkeletonListProps extends SkeletonProps {
  count?: number;
}

const SkeletonList = ({
  animation = "wave",
  count = 6,
  height = 48,
  variant = "rounded",
  ...rest
}: SkeletonListProps) => {
  return Array.from({ length: count }).map((_, i) => (
    <Skeleton
      key={i}
      variant={variant}
      animation={animation}
      height={height}
      {...rest}
    />
  ));
};

export default SkeletonList;
