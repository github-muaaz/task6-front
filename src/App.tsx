import Board from './component/Board';

const CanvasDrawing = () => {

  return (
    <div style={{height: '100vh'}} className="bg-danger">
        <h1 className="text-center">Board 1</h1>

        <Board/>
    </div>
  );
};

export default CanvasDrawing;
