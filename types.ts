export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DATASET = 'DATASET',
  TRAINING = 'TRAINING',
  EVALUATION = 'EVALUATION',
  INFERENCE = 'INFERENCE',
}

export interface BoundingBox {
  label: string;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  confidence?: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  map: number;
}

export interface DatasetImage {
  id: string;
  url: string;
  annotated: boolean;
  label?: string;
}

export enum ModelType {
  YOLO_V8 = 'YOLOv8',
  FASTER_RCNN = 'Faster R-CNN',
  SSD_MOBILENET = 'SSD MobileNet',
}
