import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import time
import numpy as np

# ページ設定
st.set_page_config(
    page_title="ハードウェアとソフトウェア",
    page_icon="💻",
    layout="wide"
)

# タイトルとキャプション
st.title("💻 ハードウェアとソフトウェア")
st.caption("Created by Dit-Lab.(Daiki ITO)")
st.caption("Supported by Tomoaki ATSUMI")

# セッション状態の初期化
if 'processing_step' not in st.session_state:
    st.session_state.processing_step = 0
if 'animation_started' not in st.session_state:
    st.session_state.animation_started = False
if 'selected_process' not in st.session_state:
    st.session_state.selected_process = "簡単な計算"

def create_hardware_diagram(step=0, process_type="計算", data="2+3", result="5"):
    """ハードウェア構成図とアニメーションを作成"""
    fig = go.Figure()
    
    # ハードウェアコンポーネントの位置
    components = {
        'input': {'x': 1, 'y': 4, 'name': '入力装置', 'color': '#FF6B6B'},
        'control': {'x': 3, 'y': 3, 'name': '制御装置', 'color': '#4ECDC4'},
        'memory': {'x': 5, 'y': 4, 'name': '記憶装置', 'color': '#45B7D1'},
        'alu': {'x': 3, 'y': 1, 'name': '演算装置', 'color': '#96CEB4'},
        'output': {'x': 7, 'y': 4, 'name': '出力装置', 'color': '#FFEAA7'}
    }
    
    # コンポーネントの描画
    for comp_name, comp in components.items():
        # アクティブなステップのハイライト
        is_active = False
        if step == 1 and comp_name == 'input':
            is_active = True
        elif step == 2 and comp_name == 'control':
            is_active = True
        elif step == 3 and comp_name == 'alu':
            is_active = True
        elif step == 4 and comp_name == 'memory':
            is_active = True
        elif step == 5 and comp_name == 'output':
            is_active = True
            
        # コンポーネントボックス
        fig.add_trace(go.Scatter(
            x=[comp['x']], y=[comp['y']],
            mode='markers+text',
            marker=dict(
                size=80 if is_active else 60,
                color=comp['color'],
                opacity=1.0 if is_active else 0.7,
                line=dict(width=3 if is_active else 1, color='black')
            ),
            text=comp['name'],
            textposition='middle center',
            textfont=dict(size=10, color='black', family='Arial'),
            showlegend=False
        ))
    
    # データフローの矢印
    arrows = []
    if step >= 1:  # 入力装置 → 記憶装置
        arrows.append({'start': 'input', 'end': 'memory', 'label': data})
    if step >= 2:  # 制御装置の指示
        arrows.append({'start': 'control', 'end': 'alu', 'label': '指示'})
        arrows.append({'start': 'memory', 'end': 'control', 'label': '命令読取'})
    if step >= 3:  # 演算装置での処理
        arrows.append({'start': 'memory', 'end': 'alu', 'label': data})
    if step >= 4:  # 結果を記憶装置へ
        arrows.append({'start': 'alu', 'end': 'memory', 'label': result})
    if step >= 5:  # 出力装置へ
        arrows.append({'start': 'memory', 'end': 'output', 'label': result})
    
    # 矢印の描画
    for arrow in arrows:
        start = components[arrow['start']]
        end = components[arrow['end']]
        
        # 矢印の開始点と終了点を円の境界に調整
        dx = end['x'] - start['x']
        dy = end['y'] - start['y']
        length = np.sqrt(dx**2 + dy**2)
        
        if length > 0:
            dx_norm = dx / length
            dy_norm = dy / length
            
            # 円の半径（マーカーサイズに基づく調整）
            radius = 0.4
            
            # 開始点と終了点を円の境界に調整
            start_x = start['x'] + radius * dx_norm
            start_y = start['y'] + radius * dy_norm
            end_x = end['x'] - radius * dx_norm
            end_y = end['y'] - radius * dy_norm
            
            # 矢印の線
            fig.add_trace(go.Scatter(
                x=[start_x, end_x],
                y=[start_y, end_y],
                mode='lines',
                line=dict(color='red', width=3),
                showlegend=False
            ))
            
            # 矢印の先端
            fig.add_annotation(
                x=end_x, y=end_y,
                ax=start_x, ay=start_y,
                xref='x', yref='y',
                axref='x', ayref='y',
                arrowhead=2,
                arrowsize=1.5,
                arrowwidth=3,
                arrowcolor='red',
                showarrow=True
            )
            
            # データラベル
            mid_x = (start_x + end_x) / 2
            mid_y = (start_y + end_y) / 2 + 0.2
            fig.add_annotation(
                x=mid_x, y=mid_y,
                text=arrow['label'],
                showarrow=False,
                font=dict(size=12, color='red', family='Arial'),
                bgcolor='white',
                bordercolor='red',
                borderwidth=1
            )
    
    # レイアウト設定
    fig.update_layout(
        title=f"ステップ {step}: {get_step_description(step, process_type)}",
        xaxis=dict(range=[0, 8], showgrid=False, showticklabels=False, zeroline=False),
        yaxis=dict(range=[0, 5], showgrid=False, showticklabels=False, zeroline=False),
        plot_bgcolor='white',
        paper_bgcolor='white',
        height=500,
        margin=dict(l=20, r=20, t=80, b=20)
    )
    
    return fig

def get_step_description(step, process_type):
    """各ステップの説明を取得"""
    descriptions = {
        0: "処理開始前",
        1: f"{process_type}データが入力装置からコンピュータに入力されます",
        2: "制御装置が命令を読み取り、各装置に指示を出します",
        3: "演算装置がデータを処理します",
        4: "処理結果が記憶装置に保存されます",
        5: "最終結果が出力装置に送られて表示されます"
    }
    return descriptions.get(step, "")

def process_calculation(expression):
    """計算処理"""
    try:
        # 簡単な計算のみ許可
        allowed_chars = set('0123456789+-*/ ().')
        if not all(c in allowed_chars for c in expression):
            return None
        result = eval(expression)
        return str(result)
    except:
        return None

def process_text_display(text):
    """文字表示処理"""
    return text

# メイン処理選択
st.markdown("## 🔧 処理の選択")
col1, col2 = st.columns(2)

with col1:
    process_type = st.selectbox(
        "処理の種類を選択してください:",
        ["簡単な計算", "文字の表示"]
    )

with col2:
    if process_type == "簡単な計算":
        user_input = st.text_input(
            "計算式を入力してください (例: 2+3, 10*5):",
            value="2+3"
        )
        result = process_calculation(user_input)
        if result is None:
            st.error("有効な計算式を入力してください")
    else:
        user_input = st.text_input(
            "表示したい文字を入力してください:",
            value="Hello"
        )
        result = process_text_display(user_input)

# 処理開始ボタン
if st.button("🚀 処理開始", type="primary"):
    st.session_state.animation_started = True
    st.session_state.processing_step = 0

# アニメーション制御
if st.session_state.animation_started:
    st.markdown("## 💻 ハードウェア処理フロー")
    
    # ステップ制御
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if st.button("⏮️ 前のステップ"):
            if st.session_state.processing_step > 0:
                st.session_state.processing_step -= 1
    with col2:
        if st.button("▶️ 次のステップ"):
            if st.session_state.processing_step < 5:
                st.session_state.processing_step += 1
    with col3:
        if st.button("🔄 リセット"):
            st.session_state.processing_step = 0
    with col4:
        auto_play = st.checkbox("自動再生")
    
    # 自動再生
    if auto_play and st.session_state.processing_step < 5:
        time.sleep(2)
        st.session_state.processing_step += 1
        st.rerun()
    
    # ハードウェア図の表示
    if result:
        fig = create_hardware_diagram(
            step=st.session_state.processing_step,
            process_type=process_type,
            data=user_input,
            result=result
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # ステップの詳細説明
    step_details = {
        0: "コンピュータは処理を開始する準備ができています。",
        1: f"**入力装置**: ユーザーが入力した「{user_input}」がキーボードやマウスなどを通じてコンピュータに送られ、一時的にメモリに保存されます。",
        2: f"**制御装置**: CPUの一部である制御装置が、メモリから命令を読み取り、「{process_type}を実行せよ」という指示を演算装置に送ります。",
        3: f"**演算装置**: CPUの演算装置（ALU）が制御装置の指示に従って「{user_input}」を処理し、結果「{result}」を計算します。",
        4: f"**記憶装置**: 演算装置で計算された結果「{result}」がメモリ（主記憶装置）に一時的に保存されます。",
        5: f"**出力装置**: 制御装置の指示により、メモリに保存された結果「{result}」がディスプレイやスピーカーなどの出力装置に送られ、ユーザーに表示されます。"
    }
    
    st.markdown(f"### 📝 ステップ {st.session_state.processing_step} の詳細")
    st.markdown(step_details[st.session_state.processing_step])
    
    # 処理完了後のソフトウェア説明
    if st.session_state.processing_step == 5:
        st.markdown("---")
        st.markdown("## 🔗 ソフトウェアとハードウェアの関係")
        
        st.markdown("""
        ### ソフトウェアの役割
        
        **ソフトウェア**は、コンピュータのハードウェアに「何をすべきか」を指示する命令やプログラムの集合体です。
        
        今回の処理で起こったこと：
        - 📝 **プログラム（ソフトウェア）**が「計算せよ」「表示せよ」という命令を作成
        - 🎯 **制御装置**がその命令を解釈し、適切なハードウェアに指示
        - ⚙️ **各ハードウェア**が連携してソフトウェアの指示通りに動作
        
        つまり、ソフトウェアなしではハードウェアは何もできず、ハードウェアなしではソフトウェアは動作できません。
        両者が密接に連携することで、私たちが日常的に使っているコンピュータの機能が実現されているのです。
        """)
        
        # 補足の可視化
        fig_relation = go.Figure()
        
        # ソフトウェアとハードウェアの関係図
        fig_relation.add_trace(go.Scatter(
            x=[2], y=[4],
            mode='markers+text',
            marker=dict(size=100, color='lightblue', line=dict(width=2, color='blue')),
            text='ソフトウェア<br>(プログラム・命令)',
            textposition='middle center',
            showlegend=False
        ))
        
        fig_relation.add_trace(go.Scatter(
            x=[6], y=[4],
            mode='markers+text',
            marker=dict(size=100, color='lightcoral', line=dict(width=2, color='red')),
            text='ハードウェア<br>(物理的な装置)',
            textposition='middle center',
            showlegend=False
        ))
        
        # 双方向の矢印
        fig_relation.add_annotation(
            x=4, y=4.3,
            ax=2.8, ay=4.3,
            xref='x', yref='y',
            axref='x', ayref='y',
            arrowhead=2,
            arrowsize=1.5,
            arrowwidth=2,
            arrowcolor='green',
            showarrow=True
        )
        
        fig_relation.add_annotation(
            x=3.2, y=3.7,
            ax=5.2, ay=3.7,
            xref='x', yref='y',
            axref='x', ayref='y',
            arrowhead=2,
            arrowsize=1.5,
            arrowwidth=2,
            arrowcolor='orange',
            showarrow=True
        )
        
        fig_relation.add_annotation(
            x=4, y=4.5,
            text='命令・指示',
            showarrow=False,
            font=dict(size=12, color='green')
        )
        
        fig_relation.add_annotation(
            x=4, y=3.5,
            text='結果・フィードバック',
            showarrow=False,
            font=dict(size=12, color='orange')
        )
        
        fig_relation.update_layout(
            title="ソフトウェアとハードウェアの関係",
            xaxis=dict(range=[0, 8], showgrid=False, showticklabels=False, zeroline=False),
            yaxis=dict(range=[2, 6], showgrid=False, showticklabels=False, zeroline=False),
            plot_bgcolor='white',
            height=300
        )
        
        st.plotly_chart(fig_relation, use_container_width=True)

# 学習のまとめ
st.markdown("---")
st.markdown("## 📚 学習のポイント")

with st.expander("💡 今日学んだこと"):
    st.markdown("""
    ### コンピュータの5大装置
    1. **入力装置** - ユーザーからの情報を受け取る
    2. **制御装置** - 全体の処理を制御・指示する
    3. **演算装置** - 実際の計算や論理処理を行う
    4. **記憶装置** - データや命令を保存する
    5. **出力装置** - 結果をユーザーに伝える
    
    ### ソフトウェアとハードウェア
    - **ハードウェア**: コンピュータの物理的な部品
    - **ソフトウェア**: ハードウェアに指示を与えるプログラム
    - 両者が協力することで、私たちの身の回りのデジタル機器が動作している
    """)
